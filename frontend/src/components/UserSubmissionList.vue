<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { UserSubmission, SubmissionMetrics } from '@/types/submission';
import { getAssessmentSubmissions } from '@/services/api-service';

interface Props {
  assessmentId: string;
}

const props = defineProps<Props>();

const submissions = ref<UserSubmission[]>([]);
const metrics = ref<SubmissionMetrics | null>(null);
const loading = ref(true);
const selectedSubmission = ref<UserSubmission | null>(null);
const showSubmissionModal = ref(false);

// Mock data for demonstration
const mockSubmissions: UserSubmission[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    is_completed: true,
    grade: 85,
    completed_at: '2024-01-15T14:30:00Z',
    submitted_via: 'manual',
    time_taken_minutes: 45,
    total_questions: 10,
    questions_answered: 9,
    accuracy_percentage: 88.9,
    ai_tool_usage_count: 3,
    external_resource_usage: 2,
    code_quality_score: 8.5,
    communication_score: 9.0,
    problem_solving_score: 8.0,
    overall_performance: 85.0
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    is_completed: true,
    grade: 92,
    completed_at: '2024-01-15T16:15:00Z',
    submitted_via: 'timeout',
    time_taken_minutes: 60,
    total_questions: 10,
    questions_answered: 10,
    accuracy_percentage: 95.0,
    ai_tool_usage_count: 1,
    external_resource_usage: 0,
    code_quality_score: 9.5,
    communication_score: 9.2,
    problem_solving_score: 9.8,
    overall_performance: 92.0
  },
  {
    id: '3',
    email: 'mike.wilson@example.com',
    is_completed: false,
    submitted_via: 'manual',
    time_taken_minutes: 25,
    total_questions: 10,
    questions_answered: 4,
    accuracy_percentage: 75.0,
    ai_tool_usage_count: 5,
    external_resource_usage: 3,
    code_quality_score: 6.0,
    communication_score: 7.0,
    problem_solving_score: 5.5,
    overall_performance: 62.0
  },
  {
    id: '4',
    email: 'sarah.johnson@example.com',
    is_completed: true,
    grade: 78,
    completed_at: '2024-01-16T09:45:00Z',
    submitted_via: 'manual',
    time_taken_minutes: 52,
    total_questions: 10,
    questions_answered: 8,
    accuracy_percentage: 87.5,
    ai_tool_usage_count: 2,
    external_resource_usage: 1,
    code_quality_score: 7.8,
    communication_score: 8.5,
    problem_solving_score: 7.2,
    overall_performance: 78.0
  }
];

const mockMetrics: SubmissionMetrics = {
  total_submissions: 4,
  completed_submissions: 3,
  average_grade: 85.0,
  average_completion_time: 52.3,
  average_accuracy: 86.8,
  average_ai_usage: 2.75,
  submission_trends: [
    { date: '2024-01-15', submissions: 2, completions: 2 },
    { date: '2024-01-16', submissions: 2, completions: 1 }
  ],
  performance_distribution: [
    { range: '90-100', count: 1 },
    { range: '80-89', count: 2 },
    { range: '70-79', count: 1 },
    { range: '60-69', count: 0 },
    { range: '0-59', count: 0 }
  ],
  tool_usage_breakdown: [
    { tool: 'ChatGPT', usage_count: 8 },
    { tool: 'Stack Overflow', usage_count: 3 },
    { tool: 'GitHub', usage_count: 2 },
    { tool: 'Documentation', usage_count: 1 }
  ]
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (submission: UserSubmission) => {
  if (!submission.is_completed) return 'bg-yellow-100 text-yellow-800';
  if (submission.grade && submission.grade >= 90) return 'bg-green-100 text-green-800';
  if (submission.grade && submission.grade >= 80) return 'bg-blue-100 text-blue-800';
  if (submission.grade && submission.grade >= 70) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getPerformanceColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-orange-600';
  return 'text-red-600';
};

const viewSubmissionDetails = (submission: UserSubmission) => {
  selectedSubmission.value = submission;
  showSubmissionModal.value = true;
};

const closeSubmissionModal = () => {
  showSubmissionModal.value = false;
  selectedSubmission.value = null;
};

const completionRate = computed(() => {
  if (!metrics.value) return 0;
  return Math.round((metrics.value.completed_submissions / metrics.value.total_submissions) * 100);
});

onMounted(async () => {
  try {
    const data = await getAssessmentSubmissions(props.assessmentId);
    submissions.value = data.submissions;
    metrics.value = data.metrics;
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    // Fallback to mock data if API fails
    submissions.value = mockSubmissions;
    metrics.value = mockMetrics;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Candidate Submissions</h2>
      <div class="text-sm text-gray-500">
        {{ submissions.length }} total submissions
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Metrics Overview -->
    <div v-else-if="metrics" class="mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Completion Rate -->
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90">Completion Rate</p>
              <p class="text-2xl font-bold">{{ completionRate }}%</p>
            </div>
            <div class="text-3xl">📊</div>
          </div>
        </div>

        <!-- Average Grade -->
        <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90">Average Grade</p>
              <p class="text-2xl font-bold">{{ metrics.average_grade.toFixed(1) }}%</p>
            </div>
            <div class="text-3xl">🎯</div>
          </div>
        </div>

        <!-- Average Time -->
        <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90">Avg. Time</p>
              <p class="text-2xl font-bold">{{ metrics.average_completion_time.toFixed(0) }}m</p>
            </div>
            <div class="text-3xl">⏱️</div>
          </div>
        </div>

        <!-- AI Usage -->
        <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90">Avg. AI Usage</p>
              <p class="text-2xl font-bold">{{ metrics.average_ai_usage.toFixed(1) }}</p>
            </div>
            <div class="text-3xl">🤖</div>
          </div>
        </div>
      </div>

      <!-- Performance Distribution Chart -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>
        <div class="flex items-end space-x-2 h-32">
          <div 
            v-for="(item, index) in metrics.performance_distribution" 
            :key="index"
            class="flex-1 flex flex-col items-center"
          >
            <div 
              class="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
              :style="{ height: `${(item.count / Math.max(...metrics.performance_distribution.map(d => d.count))) * 100}%` }"
            ></div>
            <span class="text-xs text-gray-600 mt-2">{{ item.range }}</span>
            <span class="text-xs font-medium text-gray-900">{{ item.count }}</span>
          </div>
        </div>
      </div>

      <!-- Tool Usage Breakdown -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Tool Usage Breakdown</h3>
        <div class="space-y-3">
          <div 
            v-for="tool in metrics.tool_usage_breakdown" 
            :key="tool.tool"
            class="flex items-center justify-between"
          >
            <span class="text-sm font-medium text-gray-700">{{ tool.tool }}</span>
            <div class="flex items-center space-x-2">
              <div class="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${(tool.usage_count / Math.max(...metrics.tool_usage_breakdown.map(t => t.usage_count))) * 100}%` }"
                ></div>
              </div>
              <span class="text-sm text-gray-600 w-8 text-right">{{ tool.usage_count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submissions Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Candidate
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Grade
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time Taken
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Performance
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr 
            v-for="submission in submissions" 
            :key="submission.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">
                      {{ submission.email.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ submission.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="getStatusColor(submission)"
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ submission.is_completed ? 'Completed' : 'In Progress' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                v-if="submission.grade"
                :class="getPerformanceColor(submission.grade)"
                class="text-sm font-semibold"
              >
                {{ submission.grade }}%
              </span>
              <span v-else class="text-sm text-gray-500">-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ submission.time_taken_minutes }}m
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    class="bg-blue-500 h-2 rounded-full"
                    :style="{ width: `${submission.overall_performance}%` }"
                  ></div>
                </div>
                <span class="text-sm text-gray-900">{{ submission.overall_performance.toFixed(0) }}%</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div v-if="submission.completed_at">
                {{ formatDate(submission.completed_at) }}
                <div class="text-xs text-gray-400">
                  {{ submission.submitted_via === 'manual' ? 'Manual' : 'Timeout' }}
                </div>
              </div>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="viewSubmissionDetails(submission)"
                class="text-blue-600 hover:text-blue-900 transition-colors"
              >
                View Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Submission Details Modal -->
  <div v-if="showSubmissionModal && selectedSubmission" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Submission Details</h2>
          <button
            @click="closeSubmissionModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Candidate Info -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Candidate Information</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-sm font-medium text-gray-500">Email:</span>
              <p class="text-gray-900">{{ selectedSubmission.email }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">Submission Method:</span>
              <p class="text-gray-900 capitalize">{{ selectedSubmission.submitted_via }}</p>
            </div>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-blue-600 mb-2">Overall Performance</h4>
            <p class="text-2xl font-bold text-blue-900">{{ selectedSubmission.overall_performance.toFixed(1) }}%</p>
          </div>
          
          <div class="bg-green-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-green-600 mb-2">Accuracy</h4>
            <p class="text-2xl font-bold text-green-900">{{ selectedSubmission.accuracy_percentage.toFixed(1) }}%</p>
          </div>
          
          <div class="bg-purple-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-purple-600 mb-2">Time Taken</h4>
            <p class="text-2xl font-bold text-purple-900">{{ selectedSubmission.time_taken_minutes }}m</p>
          </div>
          
          <div class="bg-orange-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-orange-600 mb-2">AI Tool Usage</h4>
            <p class="text-2xl font-bold text-orange-900">{{ selectedSubmission.ai_tool_usage_count }}</p>
          </div>
          
          <div class="bg-red-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-red-600 mb-2">External Resources</h4>
            <p class="text-2xl font-bold text-red-900">{{ selectedSubmission.external_resource_usage }}</p>
          </div>
          
          <div class="bg-indigo-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-indigo-600 mb-2">Questions Answered</h4>
            <p class="text-2xl font-bold text-indigo-900">{{ selectedSubmission.questions_answered }}/{{ selectedSubmission.total_questions }}</p>
          </div>
        </div>

        <!-- Detailed Scores -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Detailed Scores</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Code Quality</span>
              <div class="flex items-center space-x-2">
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-500 h-2 rounded-full"
                    :style="{ width: `${(selectedSubmission.code_quality_score / 10) * 100}%` }"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ selectedSubmission.code_quality_score }}/10</span>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Communication</span>
              <div class="flex items-center space-x-2">
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-green-500 h-2 rounded-full"
                    :style="{ width: `${(selectedSubmission.communication_score / 10) * 100}%` }"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ selectedSubmission.communication_score }}/10</span>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Problem Solving</span>
              <div class="flex items-center space-x-2">
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-purple-500 h-2 rounded-full"
                    :style="{ width: `${(selectedSubmission.problem_solving_score / 10) * 100}%` }"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ selectedSubmission.problem_solving_score }}/10</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <button
            @click="closeSubmissionModal"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Download Report
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 