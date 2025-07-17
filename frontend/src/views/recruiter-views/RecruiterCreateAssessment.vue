<script setup lang="ts">
import { createAssessment } from '@/services/api-service';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const title = ref('');
const summary = ref('');
const description = ref('');
const timeLimit = ref<number | null>(null);
const deadline = ref<string | null>(null);

const isSubmitting = ref(false);

const handleSubmit = () => {
	if (!title.value || !summary.value || !description.value) {
		alert('Please fill in all required fields.');
		return;
	}
	isSubmitting.value = true;

	// Simulate API call
	createAssessment({
		title: title.value,
		summary: summary.value,
		description: description.value,
		time_limit: timeLimit.value ? timeLimit.value : undefined,
		deadline: deadline.value ? deadline.value : undefined,
	})
		.then(() => {
			router.push('/recruiter-dashboard');
		})
		.catch((error) => {
			alert(`Error creating assessment: ${error.message}`);
		})
		.finally(() => {
			isSubmitting.value = false;
		});
};
</script>

<template>
	<div class=" min-h-screen max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
		<h2 class="text-2xl font-semibold mb-6">Create New Assessment</h2>
		<form @submit.prevent="handleSubmit" class="space-y-5">
			<!-- Title -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-red-500">*</span></label>
				<input
					type="text"
					v-model="title"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<!-- Summary -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">Summary <span class="text-red-500">*</span></label>
				<textarea
					v-model="summary"
					required
					rows="3"
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				></textarea>
			</div>

			<!-- description -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">description <span class="text-red-500">*</span></label>
				<textarea
					v-model="description"
					required
					rows="6"
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
					placeholder="Enter questions, markdown, or text..."
				></textarea>
			</div>

			<!-- Time Limit -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
				<input
					type="number"
					v-model.number="timeLimit"
					min="0"
					placeholder="e.g., 60"
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<!-- Deadline -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
				<input
					type="date"
					v-model="deadline"
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>

			<!-- Submit -->
			<div>
				<button
					type="submit"
					:disabled="isSubmitting"
					class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
				>
					{{ isSubmitting ? 'Submitting...' : 'Create Assessment' }}
				</button>
			</div>
		</form>
	</div>
</template>
