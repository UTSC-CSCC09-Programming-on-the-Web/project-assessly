<template>
	<div class="bg-gray-50 py-8">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<!-- Header -->
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-gray-900 mb-4">Complete your Assessment</h1>
				
				<!-- Submit Assessment Button -->
				<div class="mt-4">
					<button
						@click="handleSubmitAssessment"
						class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
					>
						<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
						Submit Assessment
					</button>
				</div>
			</div>

			<!-- Progress Tracker -->
			<div class="mb-8">
				<AssessmentProgressTracker 
					:assessment-title="assessment?.title || 'Assessment'" 
				/>
			</div>

			<!-- Live Assistant Component -->
			<LiveAssistant :assessment="assessment" />
		</div>
	</div>
	<CandidateAssessmentDetailsView
		:id="props.id"
		:completingAssessment="true"
	/>

</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import LiveAssistant from '@/components/LiveAssistant.vue';
import CandidateAssessmentDetailsView from './candidate-views/CandidateAssessmentDetailsView.vue';
import AssessmentProgressTracker from '@/components/AssessmentProgressTracker.vue';

import { useTimer } from '@/composables/useTimer';
import { getCandidatesAssessmentDetails, completeAssessment } from '@/services/api-service';

interface Props {
	id: string;
}

const props = defineProps<Props>();
const { startTimer, stopTimer } = useTimer();
const router = useRouter();
const assessment = ref<Assessment | null>(null);

const handleSubmitAssessment = async () => {
	if (confirm('Are you sure you want to submit your assessment? This action cannot be undone.')) {
		try {
			stopTimer(); // Stop the timer
			
			// Calculate time taken from the timer
			const timeTakenMinutes = Math.floor((60 - 0) / 60); // Default 60 minutes - can be enhanced
			
			await completeAssessment(props.id, undefined, 'manual', {
				time_taken_minutes: timeTakenMinutes,
				questions_answered: 9, // Default - can be enhanced later
				total_questions: 10,
				ai_tool_usage_count: 3, // Default - can be enhanced later
				external_resource_usage: 2, // Default - can be enhanced later
				overall_performance: 85 // Default - can be enhanced later
			});
			
			alert('Assessment submitted successfully!');
			router.push('/candidate-dashboard');
		} catch (error) {
			console.error('Failed to submit assessment:', error);
			alert('Failed to submit assessment. Please try again.');
		}
	}
};

onMounted(async () => {
	try {
		// Get assessment details to get the time limit
		const assessmentData = await getCandidatesAssessmentDetails(props.id);
		assessment.value = assessmentData;
		
		if (assessmentData.time_limit) {
			// Start the timer with the assessment's time limit
			startTimer(assessmentData.time_limit, props.id);
		}
	} catch (error) {
		console.error('Failed to start timer:', error);
	}
});
</script>
