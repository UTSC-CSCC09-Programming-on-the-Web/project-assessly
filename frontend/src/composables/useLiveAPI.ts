import { ref, computed, onUnmounted, readonly, type Ref } from 'vue';
import { SchemaType } from '@google/generative-ai';
import { MultimodalLiveClient } from '@/lib/multimodal-live-client';
import { AudioRecorder } from '@/lib/audio-recorder';
import { AudioStreamer } from '@/lib/audio-streamer';
import type {
	LiveConfig,
	StreamingLog,
	ToolCall,
	ServerContent,
	MultimodalLiveAPIClientConnection,
} from '@/types/liveapi';

export interface UseLiveAPIOptions extends MultimodalLiveAPIClientConnection {
	autoConnect?: boolean;
	defaultConfig?: LiveConfig;
}

export function useLiveAPI(options: UseLiveAPIOptions) {
	// Reactive state
	const client: Ref<MultimodalLiveClient | null> = ref(null);
	const connected = ref(false);
	const connecting = ref(false);
	const logs: Ref<StreamingLog[]> = ref([]);
	const error: Ref<string | null> = ref(null);
	const currentConfig: Ref<LiveConfig | null> = ref(null);

	// Audio state
	const audioRecorder: Ref<AudioRecorder | null> = ref(null);
	const audioStreamer: Ref<AudioStreamer | null> = ref(null);
	const audioContext: Ref<AudioContext | null> = ref(null);
	const isRecording = ref(false);
	const isSpeaking = ref(false);
	const volume = ref(0);

	// Computed properties
	const canConnect = computed(() => !connected.value && !connecting.value);
	const canDisconnect = computed(() => connected.value || connecting.value);
	const recentLogs = computed(() => logs.value.slice(-50)); // Keep last 50 logs

	// Initialize audio context and streamer
	const initializeAudio = async () => {
		if (!audioContext.value) {
			audioContext.value = new AudioContext({ sampleRate: 24000 });
			await audioContext.value.resume();
		}

		if (!audioStreamer.value) {
			audioStreamer.value = new AudioStreamer(audioContext.value);
			audioStreamer.value.onComplete = () => {
				isSpeaking.value = false;
			};
		}
	};

	// Initialize client
	const initializeClient = () => {
		if (client.value) {
			client.value.removeAllListeners();
		}

		const newClient = new MultimodalLiveClient({
			url: options.url,
			apiKey: options.apiKey,
		});

		// Set up event listeners
		newClient.on('open', () => {
			connected.value = true;
			connecting.value = false;
			error.value = null;
		});

		newClient.on('close', () => {
			connected.value = false;
			connecting.value = false;
			isRecording.value = false;
			isSpeaking.value = false;
			stopRecording();
		});

		newClient.on('error', (err: Error) => {
			error.value = err.message;
			connecting.value = false;
			connected.value = false;
		});

		newClient.on('log', (log: StreamingLog) => {
			logs.value.push(log);
			// Keep only the last 100 logs to prevent memory issues
			if (logs.value.length > 100) {
				logs.value = logs.value.slice(-100);
			}
		});

		newClient.on('content', (content: ServerContent) => {
			// Handle text content from the AI
			console.log('Received content:', content);
		});

		newClient.on('audio', async (audioBuffer: ArrayBuffer) => {
			// Handle audio response from the AI
			isSpeaking.value = true;
			if (audioStreamer.value) {
				audioStreamer.value.addPCM16(new Uint8Array(audioBuffer));
			}
		});

		newClient.on('toolcall', (toolCall: ToolCall) => {
			// Handle tool calls from the AI
			handleToolCall(toolCall);
		});

		newClient.on('setupcomplete', () => {
			console.log('Setup complete');
		});

		newClient.on('turncomplete', () => {
			if (audioStreamer.value) {
				audioStreamer.value.complete();
			}
		});

		newClient.on('interrupted', () => {
			isSpeaking.value = false;
			if (audioStreamer.value) {
				audioStreamer.value.stop();
			}
			console.log('Turn interrupted');
		});

		client.value = newClient;
	};

	// Connect to the Live API
	const connect = async (config?: LiveConfig) => {
		if (!canConnect.value) return;

		const configToUse = config || options.defaultConfig || getDefaultConfig();

		try {
			connecting.value = true;
			error.value = null;

			await initializeAudio();

			if (!client.value) {
				initializeClient();
			}

			await client.value!.connect(configToUse);
			currentConfig.value = configToUse;
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Connection failed';
			connecting.value = false;
		}
	};

	// Disconnect from the Live API
	const disconnect = () => {
		if (client.value) {
			client.value.disconnect();
			stopRecording();
			if (audioStreamer.value) {
				audioStreamer.value.stop();
			}
			if (audioContext.value) {
				audioContext.value.close();
				audioContext.value = null;
			}
		}
	};

	// Send a text message
	const sendMessage = (text: string) => {
		if (client.value && connected.value) {
			client.value.send([{ text }]);
		}
	};

	// Start audio recording
	const startRecording = async () => {
		if (!connected.value || isRecording.value) return;

		try {
			if (!audioRecorder.value) {
				audioRecorder.value = new AudioRecorder(16000);

				audioRecorder.value.on('data', (base64Data: string) => {
					if (client.value && connected.value && isRecording.value) {
						client.value.sendRealtimeInput([
							{
								mimeType: 'audio/pcm',
								data: base64Data,
							},
						]);
					}
				});

				audioRecorder.value.on('volume', (vol: number) => {
					volume.value = vol;
				});
			}

			await audioRecorder.value.start();
			isRecording.value = true;
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed to start recording';
		}
	};

	// Stop audio recording
	const stopRecording = () => {
		if (audioRecorder.value) {
			audioRecorder.value.stop();
			audioRecorder.value = null;
		}
		isRecording.value = false;
		volume.value = 0;
	};

	// Handle tool calls
	const handleToolCall = async (toolCall: ToolCall) => {
		for (const call of toolCall.functionCalls) {
			try {
				const response = await executeFunction(call.name, call.args);

				if (client.value) {
					client.value.sendToolResponse({
						functionResponses: [
							{
								id: call.id,
								response,
							},
						],
					});
				}
			} catch (err) {
				console.error(`Error executing function ${call.name}:`, err);
			}
		}
	};

	// Execute a function (extensible)
	const executeFunction = async (name: string, args: any): Promise<any> => {
		switch (name) {
			case 'get_current_time':
				return { time: new Date().toLocaleTimeString() };

			case 'search_assessments':
				// This could integrate with your assessment system
				const query = args?.query || '';
				const type = args?.type || '';
				return {
					query,
					type,
					results: [
						{
							title: 'Technical Assessment Guide',
							type: 'Technical',
							status: 'Available',
						},
						{
							title: 'Research Methodology',
							type: 'Research',
							status: 'Available',
						},
						{
							title: 'Creative Writing Standards',
							type: 'Creative',
							status: 'Available',
						},
					].filter(
						(item) =>
							(!query || item.title.toLowerCase().includes(query.toLowerCase())) &&
							(!type || item.type === type),
					),
				};

			default:
				return { error: `Unknown function: ${name}` };
		}
	};

	// Clear logs
	const clearLogs = () => {
		logs.value = [];
	};

	// Default configuration
	const getDefaultConfig = (): LiveConfig => ({
		model: 'models/gemini-2.0-flash-exp',
		systemInstruction: {
			parts: [
				{
					text: `You are an AI assistant for Assessly, an assessment management platform. You help users with:
        
        - Finding and filtering assessments
        - Understanding assessment requirements
        - Providing study guidance
        - Answering questions about assessment formats
        - Helping with technical and research assessments
        
        Be helpful, concise, and focused on education and assessment topics. If users ask about topics outside assessments, politely redirect them back to assessment-related help.`,
				},
			],
		},
		generationConfig: {
			responseModalities: 'audio',
			speechConfig: {
				voiceConfig: {
					prebuiltVoiceConfig: { voiceName: 'Aoede' },
				},
			},
		},
		tools: [
			{
				functionDeclarations: [
					{
						name: 'search_assessments',
						description: 'Search for assessments in the platform',
						parameters: {
							type: SchemaType.OBJECT,
							properties: {
								query: {
									type: SchemaType.STRING,
									description: 'Search query for assessments',
								},
								type: {
									type: SchemaType.STRING,
									description: 'Assessment type filter',
								},
							},
						},
					},
					{
						name: 'get_current_time',
						description: 'Get the current time',
						parameters: {
							type: SchemaType.OBJECT,
							properties: {},
						},
					},
				],
			},
		],
	});

	// Initialize on mount
	initializeClient();

	// Auto-connect if specified
	if (options.autoConnect) {
		connect();
	}

	// Cleanup on unmount
	onUnmounted(() => {
		disconnect();
	});

	return {
		// State
		client: readonly(client),
		connected: readonly(connected),
		connecting: readonly(connecting),
		logs: readonly(recentLogs),
		error: readonly(error),
		currentConfig: readonly(currentConfig),

		// Audio state
		isRecording: readonly(isRecording),
		isSpeaking: readonly(isSpeaking),
		volume: readonly(volume),

		// Computed
		canConnect,
		canDisconnect,

		// Actions
		connect,
		disconnect,
		sendMessage,
		startRecording,
		stopRecording,
		clearLogs,

		// Utilities
		initializeClient,
	};
}
