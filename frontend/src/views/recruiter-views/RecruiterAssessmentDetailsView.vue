<script setup lang="ts">
import { computed, onMounted, ref, Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAssessment } from '@/composables/useAssessments';
import MarkdownIt from 'markdown-it';
import { Assessment } from '@/types/assessment';
import { createAssignment, getRecruitersAssessmentDetails } from '@/services/api-service';

interface Props {
	id: string;
}

const props = defineProps<Props>();
const router = useRouter();

const assessment: Ref<Assessment | undefined> = ref(undefined);
const loading = ref(true);
const error = ref<string | null>(null);

// Markdown parser setup
const md = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
});

const renderedContent = computed(() => {
	if (!assessment.value?.description) return '';
	return md.render(assessment.value.description);
});

const statusColor = computed(() => {
	if (!assessment.value?.status) return 'bg-gray-100 text-gray-800';

	switch (assessment.value.status) {
		case 'Done':
			return 'bg-green-100 text-green-800';
		case 'In Progress':
			return 'bg-yellow-100 text-yellow-800';
		default:
			return 'bg-blue-100 text-blue-800';
	}
});

const formatDate = (date?: string | null) => {
	if (!date) return 'N/A';
	const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
	return new Date(date).toLocaleDateString(undefined, options);
};

const formatDuration = (minutes?: number | null) => {
	if (!minutes) return 'N/A';
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return h ? `${h}h ${m}m` : `${m} minutes`;
};

const goBack = () => {
	router.push('/recruiter-dashboard');
};

const showModal = ref(false);
const email = ref('');
const sending = ref(false);
const sendError = ref<string | null>(null);

const handleSendToCandidates = () => {
	showModal.value = true;
};

const closeModal = () => {
	showModal.value = false;
	email.value = '';
	sendError.value = null;
};

const handleSend = async () => {
	sending.value = true;
	sendError.value = null;

	try {
		const res = await createAssignment(props.id, email.value);
		if (!res) throw new Error();
		alert('Assessment sent successfully!');
		closeModal();
	} catch (err: any) {
		sendError.value = err.message || 'Failed to send assessment.';
	} finally {
		sending.value = false;
	}
};


onMounted(async () => {
	await getRecruitersAssessmentDetails(props.id)
		.then((data) => {
			assessment.value = data;
		})
		.catch((err) => {
			error.value = err.message || 'Failed to load assessment details';
		})
		.finally(() => {
			loading.value = false;
		});
});
</script>

<template>
	<div class="min-h-screen bg-gray-50">
		<!-- Loading State -->
		<div v-if="loading" class="flex justify-center items-center min-h-screen">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>

		<!-- Error State -->
		<div v-else-if="error" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
			<div class="text-gray-400 text-6xl mb-4">😞</div>
			<h1 class="text-2xl font-bold text-gray-900 mb-4">Assessment Not Found</h1>
			<p class="text-gray-600 mb-8">{{ error }}</p>
			<button
				@click="goBack"
				class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
			>
				<svg class="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				Back to Assessments
			</button>
		</div>

		<!-- Assessment Content -->
		<div v-else-if="assessment" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<!-- Navigation -->
			<nav class="mb-8">
				<button
					@click="goBack"
					class="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
				>
					<svg class="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Back to Assessments
				</button>
			</nav>

			<header class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<div class="flex flex-wrap gap-2 mb-2">
						<span
							v-if="assessment.status"
							:class="statusColor"
							class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
						>
							{{ assessment.status }}
						</span>
					</div>

					<h1 class="text-3xl md:text-4xl font-bold text-gray-900">
						{{ assessment.title }}
					</h1>
				</div>

				<div>
					<button
						@click="handleSendToCandidates"
						class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
					>
						Send to Candidates
					</button>
				</div>
			</header>

			<section class="mb-8 text-sm text-gray-700">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<span class="font-semibold text-gray-900">Deadline: </span>
						<span>{{ formatDate(assessment.deadline) }}</span>
					</div>
					<div>
						<span class="font-semibold text-gray-900">Time Limit: </span>
						<span>{{ formatDuration(assessment.time_limit) }}</span>
					</div>
				</div>
			</section>

			<!-- Content -->
			<article class="prose prose-lg max-w-none mb-12">
				<div v-html="renderedContent" class="markdown-content"></div>
			</article>
		</div>
	</div>


	<div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
		<div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
			<h2 class="text-lg font-semibold mb-4">Send Assessment</h2>
			<form @submit.prevent="handleSend">
				<label for="email" class="block text-sm font-medium text-gray-700">Candidate Email</label>
				<input
					v-model="email"
					type="email"
					id="email"
					required
					class="mt-1 mb-2 w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
				/>

				<p v-if="sendError" class="text-red-600 text-sm mb-2">{{ sendError }}</p>

				<div class="flex justify-end gap-2">
					<button type="button" @click="closeModal" class="text-gray-600 hover:underline">Cancel</button>
					<button
						type="submit"
						class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
						:disabled="sending"
					>
						{{ sending ? 'Sending...' : 'Send' }}
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<style scoped>
/* Markdown content styling */
:deep(.markdown-content) {
	@apply text-gray-800 leading-relaxed;
}

:deep(.markdown-content h1) {
	@apply text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0;
}

:deep(.markdown-content h2) {
	@apply text-xl font-bold text-gray-900 mt-6 mb-3;
}

:deep(.markdown-content h3) {
	@apply text-lg font-semibold text-gray-900 mt-4 mb-2;
}

:deep(.markdown-content p) {
	@apply mb-4;
}

:deep(.markdown-content ul, .markdown-content ol) {
	@apply mb-4 ml-6;
}

:deep(.markdown-content li) {
	@apply mb-2;
}

:deep(.markdown-content blockquote) {
	@apply border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4;
}

:deep(.markdown-content code) {
	@apply bg-gray-100 px-2 py-1 rounded text-sm font-mono;
}

:deep(.markdown-content pre) {
	@apply bg-gray-100 p-4 rounded-md overflow-x-auto mb-4;
}

:deep(.markdown-content pre code) {
	@apply bg-transparent p-0;
}

:deep(.markdown-content table) {
	@apply w-full border-collapse mb-4;
}

:deep(.markdown-content th, .markdown-content td) {
	@apply border border-gray-300 px-4 py-2 text-left;
}

:deep(.markdown-content th) {
	@apply bg-gray-50 font-semibold;
}

:deep(.markdown-content a) {
	@apply text-blue-600 hover:text-blue-800 underline;
}

:deep(.markdown-content strong) {
	@apply font-semibold;
}

:deep(.markdown-content em) {
	@apply italic;
}
</style>
