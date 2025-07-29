<template>
	<div class="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
		<!-- Header -->
		<div class="flex items-center justify-between mb-6">
			<h2 class="text-2xl font-bold text-gray-900">AI Live Assistant</h2>
			<div class="flex items-center space-x-2">
				<div
					:class="[
						'w-3 h-3 rounded-full',
						connected ? 'bg-green-500' : connecting ? 'bg-yellow-500' : 'bg-red-500',
					]"
				></div>
				<span class="text-sm text-gray-600">
					{{ connected ? 'Connected' : connecting ? 'Connecting...' : 'Disconnected' }}
				</span>
			</div>
		</div>

		<!-- Error Display -->
		<div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
			<p class="text-red-700">{{ error }}</p>
		</div>

		<!-- API Key Input -->
		<div v-if="!connected && !connecting" class="mb-6">
			<div class="flex space-x-2">
				<button
					@click="handleConnect"
					class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Connect
				</button>
			</div>

		</div>

		<!-- Main Interface -->
		<div v-if="connected" class="space-y-6">
			<!-- Control Panel -->
			<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
				<div class="flex items-center space-x-4">
					<!-- Recording Button -->
					<button
						@click="toggleRecording"
						:class="[
							'p-3 rounded-full transition-colors',
							isRecording
								? 'bg-red-500 hover:bg-red-600 text-white'
								: 'bg-blue-500 hover:bg-blue-600 text-white',
						]"
					>
						<svg
							v-if="!isRecording"
							class="w-6 h-6"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
							<path
								d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H10.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z"
							/>
						</svg>
						<svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
							<path
								d="M5.5 3A2.5 2.5 0 003 5.5v9A2.5 2.5 0 005.5 17h9a2.5 2.5 0 002.5-2.5v-9A2.5 2.5 0 0014.5 3h-9z"
							/>
						</svg>
					</button>

					<!-- Screen Share Button -->
					<button
						@click="toggleScreenShare"
						:class="[
							'p-3 rounded-full transition-colors',
							screenCapture.isStreaming.value
								? 'bg-blue-500 hover:bg-blue-600 text-white'
								: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
						]"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
					</button>

					<!-- Status Indicators -->
					<div class="flex items-center space-x-3">
						<div v-if="isRecording" class="flex items-center space-x-2">
							<div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
							<span class="text-sm text-gray-600">Recording...</span>
							<!-- Volume indicator -->
							<div class="flex items-center space-x-1">
								<div class="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
									<div
										class="h-full bg-green-500 transition-all duration-75"
										:style="{ width: `${Math.min(volume * 100, 100)}%` }"
									></div>
								</div>
							</div>
						</div>
						<div v-if="isSpeaking" class="flex items-center space-x-2">
							<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
							<span class="text-sm text-gray-600">AI Speaking...</span>
						</div>
						<div
							v-if="screenCapture.isStreaming.value"
							class="flex items-center space-x-2"
						>
							<div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
							<span class="text-sm text-gray-600">Sharing Screen</span>
						</div>
					</div>
				</div>

				<!-- Disconnect Button -->
				<button
					@click="handleDisconnect"
					class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
				>
					Disconnect
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useLiveAPI } from '@/composables/useLiveAPI';
import { useScreenCapture } from '@/composables/useScreenCapture';
import { formatLogMessage, getLogLevelColor } from '@/utils/liveapi-utils';
import type { LiveConfig } from '@/types/liveapi';
import { SchemaType } from '@google/generative-ai';
import { getEphemeralToken } from '@/services/api-service';

// Component state
const apiKey = ref('');
const textMessage = ref('');

// Live API instance
let liveAPIInstance: ReturnType<typeof useLiveAPI> | null = null;

// Screen capture
const screenCapture = useScreenCapture();

// Reactive state
const connected = ref(false);
const connecting = ref(false);
const logs = ref<any[]>([]);
const error = ref<string | null>(null);
const isRecording = ref(false);
const isSpeaking = ref(false);
const volume = ref(0);

// Get API key from localStorage on mount
onMounted(() => {
	const savedApiKey = localStorage.getItem('google_ai_api_key');
	if (savedApiKey) {
		apiKey.value = savedApiKey;
	}
});

// Methods
const handleConnect = async () => {
	try {
		const apiKeyFromEnv = await getEphemeralToken().then((data) => data.tokenName);
		// Initialize Live API
		liveAPIInstance = useLiveAPI({
			apiKey: apiKeyFromEnv,
			defaultConfig: getAssessmentConfig(),
		});

		// Watch for state changes
		watch(
			liveAPIInstance.connected,
			(newVal) => {
				connected.value = newVal;
			},
			{ immediate: true },
		);

		watch(
			liveAPIInstance.connecting,
			(newVal) => {
				connecting.value = newVal;
			},
			{ immediate: true },
		);

		watch(
			liveAPIInstance.logs,
			(newVal) => {
				logs.value = [...newVal];
			},
			{ immediate: true, deep: true },
		);

		watch(
			liveAPIInstance.error,
			(newVal) => {
				error.value = newVal;
			},
			{ immediate: true },
		);

		watch(
			liveAPIInstance.isRecording,
			(newVal) => {
				isRecording.value = newVal;
			},
			{ immediate: true },
		);

		watch(
			liveAPIInstance.isSpeaking,
			(newVal) => {
				isSpeaking.value = newVal;
			},
			{ immediate: true },
		);

		watch(
			liveAPIInstance.volume,
			(newVal) => {
				volume.value = newVal;
			},
			{ immediate: true },
		);

		// Connect
		await liveAPIInstance.connect();
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Connection failed';
	}
};

const handleDisconnect = () => {
	if (liveAPIInstance) {
		liveAPIInstance.disconnect();
	}
};

const toggleRecording = async () => {
	if (!liveAPIInstance) return;

	if (isRecording.value) {
		liveAPIInstance.stopRecording();
	} else {
		await liveAPIInstance.startRecording();
	}
};

const toggleScreenShare = async () => {
	if (!liveAPIInstance) return;

	if (screenCapture.isStreaming.value) {
		screenCapture.stop();
	} else {
		try {
			const stream = await screenCapture.start();

			// Send screen frames to the AI
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const video = document.createElement('video');

			video.srcObject = stream;
			video.play();

			const sendFrame = () => {
				if (!screenCapture.isStreaming.value) return;

				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				ctx?.drawImage(video, 0, 0);

				canvas.toBlob(
					(blob) => {
						if (blob && liveAPIInstance) {
							const reader = new FileReader();
							reader.onload = () => {
								const base64 = (reader.result as string).split(',')[1];
								liveAPIInstance?.client.value?.sendRealtimeInput([
									{
										mimeType: 'image/jpeg',
										data: base64,
									},
								]);
							};
							reader.readAsDataURL(blob);
						}
					},
					'image/jpeg',
					0.8,
				);

				setTimeout(sendFrame, 1000); // Send frame every second
			};

			video.onloadedmetadata = () => {
				sendFrame();
			};
		} catch (err) {
			console.error('Screen capture failed:', err);
		}
	}
};

const sendTextMessage = () => {
	if (!liveAPIInstance || !textMessage.value.trim()) return;

	liveAPIInstance.sendMessage(textMessage.value);
	textMessage.value = '';
};

const clearLogs = () => {
	if (liveAPIInstance) {
		liveAPIInstance.clearLogs();
	}
};

// Utility functions
const formatTime = (date: Date): string => {
	return date.toLocaleTimeString();
};

const getLogColor = (type: string): string => {
	return getLogLevelColor(type);
};

// Assessment-specific configuration
const getAssessmentConfig = (): LiveConfig => ({
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
</script>

<style scoped>
.animate-pulse {
	animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
}
</style>
