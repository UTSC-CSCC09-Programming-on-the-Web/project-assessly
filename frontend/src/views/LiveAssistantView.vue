<template>
	<div class=" bg-gray-50 py-8">
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
import LiveAssistant from '@/components/LiveAssistant.vue';
import CandidateAssessmentDetailsView from './candidate-views/CandidateAssessmentDetailsView.vue';

interface Props {
	id: string;
}

const props = defineProps<Props>();
</script>
