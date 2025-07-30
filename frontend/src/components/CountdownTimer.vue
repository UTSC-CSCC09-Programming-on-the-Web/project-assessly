<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

interface Props {
  duration: number; // Duration in minutes
  onTimeUp?: () => void;
  showWarning?: boolean;
  warningThreshold?: number; // Minutes before warning
}

const props = withDefaults(defineProps<Props>(), {
  showWarning: true,
  warningThreshold: 5, // 5 minutes warning
});

const timeRemaining = ref(props.duration * 60); // Convert to seconds
const isRunning = ref(false);
const intervalId = ref<number | null>(null);

const formattedTime = computed(() => {
  const hours = Math.floor(timeRemaining.value / 3600);
  const minutes = Math.floor((timeRemaining.value % 3600) / 60);
  const seconds = timeRemaining.value % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const timeColor = computed(() => {
  if (timeRemaining.value <= 0) return 'text-red-600';
  if (timeRemaining.value <= props.warningThreshold * 60) return 'text-orange-600';
  return 'text-gray-900';
});

const bgColor = computed(() => {
  if (timeRemaining.value <= 0) return 'bg-red-100 border-red-300';
  if (timeRemaining.value <= props.warningThreshold * 60) return 'bg-orange-100 border-orange-300';
  return 'bg-blue-100 border-blue-300';
});

const startTimer = () => {
  if (isRunning.value) return;
  
  isRunning.value = true;
  intervalId.value = window.setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    } else {
      stopTimer();
      if (props.onTimeUp) {
        props.onTimeUp();
      }
    }
  }, 1000);
};

const stopTimer = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
  isRunning.value = false;
};

const resetTimer = () => {
  stopTimer();
  timeRemaining.value = props.duration * 60;
};

const pauseTimer = () => {
  stopTimer();
};

// Watch for prop changes
watch(() => props.duration, (newDuration) => {
  timeRemaining.value = newDuration * 60;
});

onMounted(() => {
  // Auto-start timer when component mounts
  startTimer();
});

onUnmounted(() => {
  stopTimer();
});

// Expose methods for parent components
defineExpose({
  startTimer,
  stopTimer,
  resetTimer,
  pauseTimer,
  isRunning: computed(() => isRunning.value),
  timeRemaining: computed(() => timeRemaining.value)
});
</script>

<template>
  <div class="countdown-timer">
    <div 
      :class="[
        'inline-flex items-center px-4 py-2 rounded-lg border-2 font-mono text-lg font-bold transition-colors duration-300',
        bgColor,
        timeColor
      ]"
    >
      <svg 
        class="w-5 h-5 mr-2" 
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
    </div>
    
    <!-- Warning message when time is running low -->
    <div 
      v-if="showWarning && timeRemaining <= warningThreshold * 60 && timeRemaining > 0"
      class="mt-2 text-sm text-orange-600 font-medium text-center"
    >
      ⚠️ Time is running out! Please complete your assessment soon.
    </div>
    
    <!-- Time's up message -->
    <div 
      v-if="timeRemaining <= 0"
      class="mt-2 text-sm text-red-600 font-bold text-center"
    >
      ⏰ Time's up! Your assessment will be submitted automatically.
    </div>
  </div>
</template>

<style scoped>
.countdown-timer {
  @apply flex flex-col items-center;
}
</style> 