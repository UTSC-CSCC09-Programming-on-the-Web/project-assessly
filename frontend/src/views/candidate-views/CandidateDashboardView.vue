<script setup lang="ts">
import { computed, onMounted, Ref, ref } from 'vue';
import AssessmentCard from '@/components/AssessmentCard.vue';
import { getCandidatesAssessments } from '@/services/api-service';
import { Assessment } from '@/types/assessment';

const assessments: Ref<Assessment[]> = ref([]);
const stats = ref({
	total: 0,
	done: 0,
});
const loading = ref(true);
const error = ref<string | null>(null);
const isEmpty = computed(() => {
	return !loading.value && assessments.value.length === 0;
});


const fetchAssessments = async () => {
	try {
		loading.value = true;
		const response = await getCandidatesAssessments();
		assessments.value = response.assessments;
		stats.value.total = response.totalCount;
		stats.value.done = response.completedCount;
	} catch (err) {
		error.value = err.message || 'Failed to load assessments';
	} finally {
		loading.value = false;
	}
};

const getStatus = (assessment: Assessment): string => {
	if (assessment.Assignments && assessment.Assignments.length > 0 && assessment.Assignments[0]?.is_completed) {
		return 'Done';
	} else if (!assessment.deadline || new Date(assessment.deadline) < new Date()) {
		return 'In Progress';
	}
	return 'Not Completed';
};

onMounted(fetchAssessments);
</script>

<template>
	<div class="min-h-screen bg-gray-50">
		<!-- Header -->
		<header class="bg-white shadow-sm">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div class="text-center">
					<h1 class="text-3xl font-bold text-gray-900 sm:text-4xl">Candidate Dashboard</h1>
				</div>
			</div>
		</header>

		<!-- Stats Bar -->
		<section class="bg-blue-50 py-8">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid grid-cols-3 md:grid-cols-3 gap-3 text-center">
					<div>
						<div class="text-2xl font-bold text-blue-600">
							{{ stats.total }}
						</div>
						<div class="text-sm text-gray-600">Total</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-green-600">
							{{ stats.done }}
						</div>
						<div class="text-sm text-gray-600">Completed</div>
					</div>
					<div>
						<div class="text-2xl font-bold text-blue-600">
							{{ stats.done / (stats.total || 1) * 100 }}%
						</div>
						<div class="text-sm text-gray-600">Completion Rate</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Loading State -->
			<div v-if="loading" class="flex justify-center items-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>

			<!-- Error State -->
			<div v-else-if="error" class="text-center py-12">
				<div class="text-red-600 mb-4">{{ error }}</div>
			</div>

			<!-- Empty State -->
			<div v-else-if="isEmpty" class="text-center py-12">
				<div class="text-gray-400 text-6xl mb-4">📄</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
			</div>

			<!-- Assessment Grid -->
			<div v-else>
				<!-- Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
					<AssessmentCard
						v-for="(assessment) in assessments"
						:key="assessment.id"
						:data="assessment"
						:role="'candidate'"
						:status="getStatus(assessment)"
					/>
				</div>
			</div>
		</main>
	</div>
</template>
