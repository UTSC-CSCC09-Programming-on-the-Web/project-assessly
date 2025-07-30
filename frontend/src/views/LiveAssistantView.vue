<template>
	<div class="bg-gray-50 py-8">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<!-- Header -->
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-gray-900 mb-4">Complete your Assessment</h1>
				

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
import LiveAssistant from '@/components/LiveAssistant.vue';
import CandidateAssessmentDetailsView from './candidate-views/CandidateAssessmentDetailsView.vue';

import { useTimer } from '@/composables/useTimer';
import { getCandidatesAssessmentDetails } from '@/services/api-service';

interface Props {
	id: string;
}

const props = defineProps<Props>();
const { startTimer } = useTimer();


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
