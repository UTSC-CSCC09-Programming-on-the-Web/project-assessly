<template>
  <div class="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">AI Live Assistant</h2>
      <div class="flex items-center space-x-2">
        <div 
          :class="[
            'w-3 h-3 rounded-full',
            connected ? 'bg-green-500' : connecting ? 'bg-yellow-500' : 'bg-red-500'
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
      <label for="apiKey" class="block text-sm font-medium text-gray-700 mb-2">
        Google AI API Key
      </label>
      <div class="flex space-x-2">
        <input
          v-model="apiKey"
          type="password"
          id="apiKey"
          placeholder="Enter your API key..."
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="handleConnect"
          :disabled="!apiKey.trim() || connecting"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect
        </button>
      </div>
      <p class="text-xs text-gray-500 mt-1">
        Get your API key from <a href="https://ai.google.dev" target="_blank" class="text-blue-600 hover:underline">Google AI Studio</a>
      </p>
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
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            ]"
          >
            <svg v-if="!isRecording" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z"/>
              <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H10.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z"/>
            </svg>
            <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 3A2.5 2.5 0 003 5.5v9A2.5 2.5 0 005.5 17h9a2.5 2.5 0 002.5-2.5v-9A2.5 2.5 0 0014.5 3h-9z"/>
            </svg>
          </button>
          
          <!-- Status Indicators -->
          <div class="flex items-center space-x-3">
            <div v-if="isRecording" class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-gray-600">Recording...</span>
            </div>
            <div v-if="isSpeaking" class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-gray-600">AI Speaking...</span>
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

      <!-- Text Input -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Send Text Message
        </label>
        <div class="flex space-x-2">
          <input
            v-model="textMessage"
            @keyup.enter="sendTextMessage"
            type="text"
            placeholder="Type a message..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            @click="sendTextMessage"
            :disabled="!textMessage.trim()"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      <!-- Logs -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Activity Log</h3>
          <button
            @click="clearLogs"
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>
        <div class="bg-black text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
          <div v-if="logs.length === 0" class="text-gray-500">
            No activity yet...
          </div>
          <div v-for="log in logs" :key="log.date.getTime()" class="mb-1">
            <span class="text-gray-400">{{ formatTime(log.date) }}</span>
            <span class="ml-2" :class="getLogColor(log.type)">{{ log.type }}</span>
            <span class="ml-2">{{ formatLogMessage(log.message) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div v-if="!connected && !connecting" class="mt-6 p-4 bg-blue-50 rounded-lg">
      <h3 class="font-medium text-blue-900 mb-2">How to use:</h3>
      <ul class="text-sm text-blue-800 space-y-1">
        <li>1. Enter your Google AI API key above</li>
        <li>2. Click "Connect" to establish connection</li>
        <li>3. Use the microphone button to start voice conversations</li>
        <li>4. Or type text messages to chat with the AI</li>
        <li>5. The AI can help you with assessments and answer questions</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useLiveAPI } from '@/composables/useLiveAPI'
import { formatLogMessage, getLogLevelColor } from '@/utils/liveapi-utils'
import type { LiveConfig } from '@/types/liveapi'
import { SchemaType } from '@google/generative-ai'

// Component state
const apiKey = ref('')
const textMessage = ref('')

// Live API instance
let liveAPIInstance: ReturnType<typeof useLiveAPI> | null = null

// Reactive state
const connected = ref(false)
const connecting = ref(false)
const logs = ref<any[]>([])
const error = ref<string | null>(null)
const isRecording = ref(false)
const isSpeaking = ref(false)

// Get API key from localStorage on mount
onMounted(() => {
  const savedApiKey = localStorage.getItem('google_ai_api_key')
  if (savedApiKey) {
    apiKey.value = savedApiKey
  }
})

// Methods
const handleConnect = async () => {
  if (!apiKey.value.trim()) return

  // Save API key
  localStorage.setItem('google_ai_api_key', apiKey.value)

  try {
    // Initialize Live API
    liveAPIInstance = useLiveAPI({
      apiKey: apiKey.value,
      defaultConfig: getAssessmentConfig()
    })

    // Watch for state changes
    watch(liveAPIInstance.connected, (newVal) => {
      connected.value = newVal
    }, { immediate: true })

    watch(liveAPIInstance.connecting, (newVal) => {
      connecting.value = newVal
    }, { immediate: true })

    watch(liveAPIInstance.logs, (newVal) => {
      logs.value = [...newVal]
    }, { immediate: true, deep: true })

    watch(liveAPIInstance.error, (newVal) => {
      error.value = newVal
    }, { immediate: true })

    watch(liveAPIInstance.isRecording, (newVal) => {
      isRecording.value = newVal
    }, { immediate: true })

    watch(liveAPIInstance.isSpeaking, (newVal) => {
      isSpeaking.value = newVal
    }, { immediate: true })

    // Connect
    await liveAPIInstance.connect()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Connection failed'
  }
}

const handleDisconnect = () => {
  if (liveAPIInstance) {
    liveAPIInstance.disconnect()
  }
}

const toggleRecording = async () => {
  if (!liveAPIInstance) return

  if (isRecording.value) {
    liveAPIInstance.stopRecording()
  } else {
    await liveAPIInstance.startRecording()
  }
}

const sendTextMessage = () => {
  if (!liveAPIInstance || !textMessage.value.trim()) return

  liveAPIInstance.sendMessage(textMessage.value)
  textMessage.value = ''
}

const clearLogs = () => {
  if (liveAPIInstance) {
    liveAPIInstance.clearLogs()
  }
}

// Utility functions
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString()
}

const getLogColor = (type: string): string => {
  return getLogLevelColor(type)
}

// Assessment-specific configuration
const getAssessmentConfig = (): LiveConfig => ({
  model: 'models/gemini-2.0-flash-exp',
  systemInstruction: {
    parts: [{
      text: `You are an AI assistant for Assessly, an assessment management platform. You help users with:
      
      - Finding and filtering assessments
      - Understanding assessment requirements
      - Providing study guidance
      - Answering questions about assessment formats
      - Helping with technical and research assessments
      
      Be helpful, concise, and focused on education and assessment topics. If users ask about topics outside assessments, politely redirect them back to assessment-related help.`
    }]
  },
  generationConfig: {
    responseModalities: 'audio',
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: 'Aoede' }
      }
    }
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
                description: 'Search query for assessments'
              },
              type: {
                type: SchemaType.STRING,
                description: 'Assessment type filter'
              }
            }
          }
        },
        {
          name: 'get_current_time',
          description: 'Get the current time',
          parameters: {
            type: SchemaType.OBJECT,
            properties: {}
          }
        }
      ]
    }
  ]
})
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style> 