import { ref, computed } from 'vue';
import { completeAssessment } from '@/services/api-service';
import { useRouter } from 'vue-router';

interface TimerState {
  isActive: boolean;
  duration: number; // in minutes
  timeRemaining: number; // in seconds
  assessmentId?: string;
}

const timerState = ref<TimerState>({
  isActive: false,
  duration: 0,
  timeRemaining: 0,
  assessmentId: undefined
});

const intervalId = ref<number | null>(null);

export function useTimer() {
  const startTimer = (duration: number, assessmentId?: string) => {
    stopTimer(); // Stop any existing timer
    
    timerState.value = {
      isActive: true,
      duration,
      timeRemaining: duration * 60,
      assessmentId
    };

    intervalId.value = window.setInterval(() => {
      if (timerState.value.timeRemaining > 0) {
        timerState.value.timeRemaining--;
      } else {
        stopTimer();
        // Handle time up event
        handleTimeUp();
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
    timerState.value.isActive = false;
  };

  const pauseTimer = () => {
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
    timerState.value.isActive = false;
  };

  const resumeTimer = () => {
    if (timerState.value.timeRemaining > 0 && !timerState.value.isActive) {
      timerState.value.isActive = true;
      intervalId.value = window.setInterval(() => {
        if (timerState.value.timeRemaining > 0) {
          timerState.value.timeRemaining--;
        } else {
          stopTimer();
          handleTimeUp();
        }
      }, 1000);
    }
  };

  const resetTimer = () => {
    stopTimer();
    timerState.value.timeRemaining = timerState.value.duration * 60;
  };

  const handleTimeUp = async () => {
    // This can be customized based on your needs
    console.log('Time is up for assessment:', timerState.value.assessmentId);
    
    if (timerState.value.assessmentId) {
      try {
        // Automatically complete the assessment when time is up
        await completeAssessment(timerState.value.assessmentId, undefined, 'timeout');
        
        // Show notification to user
        alert('Time is up! Your assessment has been automatically submitted to the recruiter.');
        
        // Redirect to candidate dashboard
        const router = useRouter();
        router.push('/candidate-dashboard');
        
      } catch (error) {
        console.error('Failed to complete assessment:', error);
        alert('Failed to submit assessment. Please contact support.');
      }
    }
  };

  const formattedTime = computed(() => {
    const hours = Math.floor(timerState.value.timeRemaining / 3600);
    const minutes = Math.floor((timerState.value.timeRemaining % 3600) / 60);
    const seconds = timerState.value.timeRemaining % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  const timeColor = computed(() => {
    if (timerState.value.timeRemaining <= 0) return 'text-red-600';
    if (timerState.value.timeRemaining <= 5 * 60) return 'text-orange-600'; // 5 minutes warning
    return 'text-gray-900';
  });

  const bgColor = computed(() => {
    if (timerState.value.timeRemaining <= 0) return 'bg-red-100 border-red-300';
    if (timerState.value.timeRemaining <= 5 * 60) return 'bg-orange-100 border-orange-300';
    return 'bg-blue-100 border-blue-300';
  });

  const isWarning = computed(() => {
    return timerState.value.timeRemaining <= 5 * 60 && timerState.value.timeRemaining > 0;
  });

  const isTimeUp = computed(() => {
    return timerState.value.timeRemaining <= 0;
  });

  return {
    // State
    timerState: computed(() => timerState.value),
    isActive: computed(() => timerState.value.isActive),
    timeRemaining: computed(() => timerState.value.timeRemaining),
    duration: computed(() => timerState.value.duration),
    
    // Computed
    formattedTime,
    timeColor,
    bgColor,
    isWarning,
    isTimeUp,
    
    // Methods
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    resetTimer
  };
} 