<script setup lang="ts">
import { ref, computed } from 'vue';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  explanation: string;
  timestamp: Date;
}

interface Props {
  assessmentTitle: string;
}

const props = defineProps<Props>();

const steps = ref<ProgressStep[]>([
  {
    id: '1',
    title: 'Understanding the Problem',
    description: 'Read and understand the assessment requirements',
    status: 'pending',
    explanation: '',
    timestamp: new Date()
  },
  {
    id: '2',
    title: 'Planning Approach',
    description: 'Plan your solution strategy',
    status: 'pending',
    explanation: '',
    timestamp: new Date()
  },
  {
    id: '3',
    title: 'Implementation',
    description: 'Implement your solution',
    status: 'pending',
    explanation: '',
    timestamp: new Date()
  },
  {
    id: '4',
    title: 'Testing & Validation',
    description: 'Test your solution and validate results',
    status: 'pending',
    explanation: '',
    timestamp: new Date()
  },
  {
    id: '5',
    title: 'Review & Documentation',
    description: 'Review your work and document your process',
    status: 'pending',
    explanation: '',
    timestamp: new Date()
  }
]);

const currentStep = ref(0);
const showExplanationModal = ref(false);
const selectedStep = ref<ProgressStep | null>(null);
const explanationText = ref('');

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500';
    case 'in-progress': return 'bg-blue-500';
    default: return 'bg-gray-300';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return 'Completed';
    case 'in-progress': return 'In Progress';
    default: return 'Pending';
  }
};

const startStep = (stepIndex: number) => {
  steps.value[stepIndex].status = 'in-progress';
  steps.value[stepIndex].timestamp = new Date();
  currentStep.value = stepIndex;
};

const completeStep = (stepIndex: number) => {
  steps.value[stepIndex].status = 'completed';
  steps.value[stepIndex].timestamp = new Date();
  
  // Auto-start next step if available
  if (stepIndex + 1 < steps.value.length) {
    startStep(stepIndex + 1);
  }
};

const addExplanation = (step: ProgressStep) => {
  selectedStep.value = step;
  explanationText.value = step.explanation;
  showExplanationModal.value = true;
};

const saveExplanation = () => {
  if (selectedStep.value) {
    selectedStep.value.explanation = explanationText.value;
    selectedStep.value.timestamp = new Date();
  }
  showExplanationModal.value = false;
  explanationText.value = '';
  selectedStep.value = null;
};

const progressPercentage = computed(() => {
  const completed = steps.value.filter(step => step.status === 'completed').length;
  return Math.round((completed / steps.value.length) * 100);
});

const completedSteps = computed(() => {
  return steps.value.filter(step => step.status === 'completed').length;
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-gray-900">Progress Tracker</h3>
      <div class="text-sm text-gray-600">
        {{ completedSteps }}/{{ steps.length }} steps completed
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Overall Progress</span>
        <span class="text-sm font-medium text-gray-700">{{ progressPercentage }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Steps -->
    <div class="space-y-4">
      <div 
        v-for="(step, index) in steps" 
        :key="step.id"
        class="border rounded-lg p-4 transition-all duration-200"
        :class="{
          'border-blue-200 bg-blue-50': step.status === 'in-progress',
          'border-green-200 bg-green-50': step.status === 'completed',
          'border-gray-200 bg-gray-50': step.status === 'pending'
        }"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-3">
            <!-- Step Number -->
            <div 
              class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
              :class="getStatusColor(step.status)"
            >
              {{ step.id }}
            </div>
            
            <!-- Step Content -->
            <div class="flex-1">
              <h4 class="text-lg font-semibold text-gray-900">{{ step.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ step.description }}</p>
              
              <!-- Explanation Display -->
              <div v-if="step.explanation" class="mt-3 p-3 bg-white rounded border">
                <p class="text-sm text-gray-700">{{ step.explanation }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  Added: {{ step.timestamp.toLocaleTimeString() }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Status and Actions -->
          <div class="flex items-center space-x-2">
            <span 
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="{
                'bg-green-100 text-green-800': step.status === 'completed',
                'bg-blue-100 text-blue-800': step.status === 'in-progress',
                'bg-gray-100 text-gray-800': step.status === 'pending'
              }"
            >
              {{ getStatusText(step.status) }}
            </span>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="mt-4 flex items-center space-x-2">
          <button
            v-if="step.status === 'pending'"
            @click="startStep(index)"
            class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Start
          </button>
          
          <button
            v-if="step.status === 'in-progress'"
            @click="completeStep(index)"
            class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Complete
          </button>
          
          <button
            @click="addExplanation(step)"
            class="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            {{ step.explanation ? 'Edit' : 'Add' }} Explanation
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Explanation Modal -->
  <div v-if="showExplanationModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ selectedStep?.title }} - Explanation
          </h3>
          <button
            @click="showExplanationModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Explain your approach and reasoning for this step:
          </label>
          <textarea
            v-model="explanationText"
            rows="6"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what you're thinking, your approach, any challenges you encountered, and how you solved them..."
          ></textarea>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="showExplanationModal = false"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveExplanation"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Save Explanation
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 