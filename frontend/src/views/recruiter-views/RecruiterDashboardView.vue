<script setup lang="ts">
import { computed } from 'vue';
import { useAssessments } from '@/composables/useAssessments';
import AssessmentCard from '@/components/AssessmentCard.vue';
import router from '@/router';

let {
	assessments,
	loading,
	error,
} = useAssessments();

const isEmpty = computed(() => {
	return !loading.value && assessments.value.length === 0;
});
</script>

<template>
	<div class="min-h-screen bg-gray-50">
		<!-- Header -->
		<header class="bg-white shadow-sm">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div class="text-center">
					<h1 class="text-3xl font-bold text-gray-900 sm:text-4xl">
						Recruiter Dashboard
					</h1>
				</div>
			</div>
		</header>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Top bar with button -->
			<div class="flex justify-end mb-4">
				<button
					class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
					@click="router.push('/recruiter-dashboard/create')"
				>
					Create Assessment
				</button>
			</div>
			<!-- Loading State -->
			<div v-if="loading" class="flex justify-center items-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>

			<!-- Error State -->
			<div v-else-if="error" class="text-center py-12">
				<div class="text-red-600 mb-4">{{ error }}</div>
				<button
					class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
				>
					Try Again
				</button>
			</div>

			<!-- Empty State -->
			<div v-else-if="isEmpty" class="text-center py-12">
				<div class="text-gray-400 text-6xl mb-4">📄</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
				<p class="text-gray-600 mb-4">No assessments are available yet.</p>
			</div>

			<!-- Assessment Grid -->
			<div v-else>
				<!-- Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
					<AssessmentCard
						v-for="assessment in assessments"
						:key="assessment.id"
						:data="assessment"
						:role="'recruiter'"
					/>
				</div>
			</div>
		</main>
	</div>
</template>
