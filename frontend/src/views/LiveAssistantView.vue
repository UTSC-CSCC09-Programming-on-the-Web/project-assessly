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

			<!-- Live Assistant Component -->
			<LiveAssistant />
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

import { useTimer } from '@/composables/useTimer';
import { getCandidatesAssessmentDetails, completeAssessment } from '@/services/api-service';

interface Props {
	id: string;
}

const props = defineProps<Props>();
const { startTimer, stopTimer } = useTimer();
const router = useRouter();

const handleSubmitAssessment = async () => {
	if (confirm('Are you sure you want to submit your assessment? This action cannot be undone.')) {
		try {
			stopTimer(); // Stop the timer
			await completeAssessment(props.id, undefined, 'manual');
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
		const assessment = await getCandidatesAssessmentDetails(props.id);
		if (assessment.time_limit) {
			// Start the timer with the assessment's time limit
			startTimer(assessment.time_limit, props.id);
		}
	} catch (error) {
		console.error('Failed to start timer:', error);
	}
});
</script>
