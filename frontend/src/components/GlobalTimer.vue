<script setup lang="ts">
import { useTimer } from '@/composables/useTimer';

const { 
  isActive, 
  formattedTime, 
  timeColor, 
  bgColor, 
  isWarning, 
  isTimeUp,
  pauseTimer,
  resumeTimer
} = useTimer();

const toggleTimer = () => {
  if (isActive.value) {
    pauseTimer();
  } else {
    resumeTimer();
  }
};
</script>

<template>
  <div v-if="isActive" class="global-timer">
    <div 
      :class="[
        'inline-flex items-center px-3 py-1.5 rounded-md border font-mono text-sm font-bold transition-colors duration-300 cursor-pointer',
        bgColor,
        timeColor
      ]"
      @click="toggleTimer"
      :title="isActive ? 'Click to pause' : 'Click to resume'"
    >
      <svg 
        class="w-4 h-4 mr-1.5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {{ formattedTime }}
      
      <!-- Pause/Play icon -->
      <svg 
        v-if="isActive" 
        class="w-3 h-3 ml-1.5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M10 9v6m4-6v6"
        />
      </svg>
      <svg 
        v-else 
        class="w-3 h-3 ml-1.5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    
    <!-- Warning indicator -->
    <div 
      v-if="isWarning"
      class="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"
    ></div>
    
    <!-- Time's up indicator -->
    <div 
      v-if="isTimeUp"
      class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"
    ></div>
  </div>
</template>

<style scoped>
.global-timer {
  @apply relative;
}
</style> 