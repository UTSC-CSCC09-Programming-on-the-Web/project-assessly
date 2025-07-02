import { ref, computed, onUnmounted, readonly, type Ref } from 'vue'
import { MultimodalLiveClient } from '@/lib/multimodal-live-client'
import type { 
  LiveConfig, 
  StreamingLog, 
  ToolCall, 
  ServerContent,
  MultimodalLiveAPIClientConnection 
} from '@/types/liveapi'

export interface UseLiveAPIOptions extends MultimodalLiveAPIClientConnection {
  autoConnect?: boolean
  defaultConfig?: LiveConfig
}

export function useLiveAPI(options: UseLiveAPIOptions) {
  // Reactive state
  const client: Ref<MultimodalLiveClient | null> = ref(null)
  const connected = ref(false)
  const connecting = ref(false)
  const logs: Ref<StreamingLog[]> = ref([])
  const error: Ref<string | null> = ref(null)
  const currentConfig: Ref<LiveConfig | null> = ref(null)

  // Audio state
  const audioContext: Ref<AudioContext | null> = ref(null)
  const isRecording = ref(false)
  const isSpeaking = ref(false)

  // Computed properties
  const canConnect = computed(() => !connected.value && !connecting.value)
  const canDisconnect = computed(() => connected.value || connecting.value)
  const recentLogs = computed(() => logs.value.slice(-50)) // Keep last 50 logs

  // Initialize client
  const initializeClient = () => {
    if (client.value) {
      client.value.removeAllListeners()
    }

    const newClient = new MultimodalLiveClient({
      url: options.url,
      apiKey: options.apiKey
    })

    // Set up event listeners
    newClient.on('open', () => {
      connected.value = true
      connecting.value = false
      error.value = null
    })

    newClient.on('close', () => {
      connected.value = false
      connecting.value = false
      isRecording.value = false
      isSpeaking.value = false
    })

    newClient.on('error', (err: Error) => {
      error.value = err.message
      connecting.value = false
      connected.value = false
    })

    newClient.on('log', (log: StreamingLog) => {
      logs.value.push(log)
      // Keep only the last 100 logs to prevent memory issues
      if (logs.value.length > 100) {
        logs.value = logs.value.slice(-100)
      }
    })

    newClient.on('content', (content: ServerContent) => {
      // Handle text content from the AI
      console.log('Received content:', content)
    })

    newClient.on('audio', async (audioBuffer: ArrayBuffer) => {
      // Handle audio response from the AI
      await playAudio(audioBuffer)
    })

    newClient.on('toolcall', (toolCall: ToolCall) => {
      // Handle tool calls from the AI
      handleToolCall(toolCall)
    })

    newClient.on('setupcomplete', () => {
      console.log('Setup complete')
    })

    newClient.on('turncomplete', () => {
      isSpeaking.value = false
    })

    newClient.on('interrupted', () => {
      isSpeaking.value = false
      console.log('Turn interrupted')
    })

    client.value = newClient
  }

  // Connect to the Live API
  const connect = async (config?: LiveConfig) => {
    if (!canConnect.value) return

    const configToUse = config || options.defaultConfig || getDefaultConfig()
    
    try {
      connecting.value = true
      error.value = null
      
      if (!client.value) {
        initializeClient()
      }

      await client.value!.connect(configToUse)
      currentConfig.value = configToUse
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Connection failed'
      connecting.value = false
    }
  }

  // Disconnect from the Live API
  const disconnect = () => {
    if (client.value) {
      client.value.disconnect()
      stopRecording()
      if (audioContext.value) {
        audioContext.value.close()
        audioContext.value = null
      }
    }
  }

  // Send a text message
  const sendMessage = (text: string) => {
    if (client.value && connected.value) {
      client.value.send([{ text }])
    }
  }

  // Start audio recording
  const startRecording = async () => {
    if (!connected.value || isRecording.value) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      if (!audioContext.value) {
        audioContext.value = new AudioContext({ sampleRate: 16000 })
      }

      const source = audioContext.value.createMediaStreamSource(stream)
      const processor = audioContext.value.createScriptProcessor(4096, 1, 1)

      processor.onaudioprocess = (event) => {
        if (client.value && connected.value && isRecording.value) {
          const inputBuffer = event.inputBuffer.getChannelData(0)
          
          // Convert to PCM16
          const pcm16 = new Int16Array(inputBuffer.length)
          for (let i = 0; i < inputBuffer.length; i++) {
            pcm16[i] = Math.max(-32768, Math.min(32767, inputBuffer[i] * 32768))
          }

          // Convert to base64 and send
          const base64Audio = arrayBufferToBase64(pcm16.buffer)
          client.value.sendRealtimeInput([{
            mimeType: 'audio/pcm',
            data: base64Audio
          }])
        }
      }

      source.connect(processor)
      processor.connect(audioContext.value.destination)
      
      isRecording.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to start recording'
    }
  }

  // Stop audio recording
  const stopRecording = () => {
    isRecording.value = false
  }

  // Play audio response
  const playAudio = async (audioBuffer: ArrayBuffer) => {
    if (!audioContext.value) {
      audioContext.value = new AudioContext({ sampleRate: 24000 })
    }

    try {
      isSpeaking.value = true
      const audioData = await audioContext.value.decodeAudioData(audioBuffer)
      const source = audioContext.value.createBufferSource()
      source.buffer = audioData
      source.connect(audioContext.value.destination)
      
      source.onended = () => {
        isSpeaking.value = false
      }
      
      source.start()
    } catch (err) {
      console.error('Error playing audio:', err)
      isSpeaking.value = false
    }
  }

  // Handle tool calls
  const handleToolCall = async (toolCall: ToolCall) => {
    for (const call of toolCall.functionCalls) {
      try {
        const response = await executeFunction(call.name, call.args)
        
        if (client.value) {
          client.value.sendToolResponse({
            functionResponses: [{
              id: call.id,
              response
            }]
          })
        }
      } catch (err) {
        console.error(`Error executing function ${call.name}:`, err)
      }
    }
  }

  // Execute a function (extensible)
  const executeFunction = async (name: string, _args: any): Promise<any> => {
    switch (name) {
      case 'get_current_time':
        return { time: new Date().toLocaleTimeString() }
      
      case 'search_assessments':
        // This could integrate with your assessment system
        return { 
          results: [
            { title: 'Assessment 1', type: 'Technical' },
            { title: 'Assessment 2', type: 'Research' }
          ]
        }
      
      default:
        return { error: `Unknown function: ${name}` }
    }
  }

  // Clear logs
  const clearLogs = () => {
    logs.value = []
  }

  // Utility function for base64 conversion
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    bytes.forEach(byte => binary += String.fromCharCode(byte))
    return btoa(binary)
  }

  // Default configuration
  const getDefaultConfig = (): LiveConfig => ({
    model: 'models/gemini-2.0-flash-exp',
    generationConfig: {
      responseModalities: 'audio',
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Aoede' }
        }
      }
    }
  })

  // Initialize on mount
  initializeClient()

  // Auto-connect if specified
  if (options.autoConnect) {
    connect()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

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
    initializeClient
  }
} 