<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAssessment } from '@/composables/useAssessments';
import { formatDate } from '@/utils/assessments';
import AssessmentAuthor from '@/components/AssessmentAuthor.vue';
import MarkdownIt from 'markdown-it';

interface Props {
	slug: string;
}

const props = defineProps<Props>();
const router = useRouter();

const { assessment, loading, error } = useAssessment(props.slug);

// Markdown parser setup
const md = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
});

const renderedContent = computed(() => {
	if (!assessment.value?.content) return '';
	return md.render(assessment.value.content);
});

const statusColor = computed(() => {
	if (!assessment.value?.status) return 'bg-gray-100 text-gray-800';

	switch (assessment.value.status) {
		case 'Done':
			return 'bg-green-100 text-green-800';
		case 'In Process':
			return 'bg-yellow-100 text-yellow-800';
		case 'Pending':
			return 'bg-gray-100 text-gray-800';
		default:
			return 'bg-blue-100 text-blue-800';
	}
});

const typeColor = computed(() => {
	if (!assessment.value?.type) return 'bg-gray-100 text-gray-800';

	switch (assessment.value.type) {
		case 'Technical content':
			return 'bg-purple-100 text-purple-800';
		case 'Narrative':
			return 'bg-blue-100 text-blue-800';
		case 'Legal':
			return 'bg-red-100 text-red-800';
		case 'Research':
			return 'bg-indigo-100 text-indigo-800';
		case 'Visual':
			return 'bg-pink-100 text-pink-800';
		case 'Financial':
			return 'bg-emerald-100 text-emerald-800';
		default:
			return 'bg-gray-100 text-gray-800';
	}
});

const goBack = () => {
	router.push('/assessments');
};

const goToAssessments = () => {
	router.push('/assessments');
};

// Update page title when assessment loads
onMounted(() => {
	if (assessment.value) {
		document.title = `${assessment.value.title} - Assessly`;
	}
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
				@click="goToAssessments"
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

			<!-- Header Image -->
			<div v-if="assessment.image" class="mb-8">
				<img
					:src="assessment.image"
					:alt="assessment.title"
					class="w-full h-auto rounded-lg border shadow-md"
				/>
			</div>

			<!-- Title and Meta -->
			<header class="mb-8">
				<div class="flex flex-wrap gap-2 mb-4">
					<span
						v-if="assessment.status"
						:class="statusColor"
						class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
					>
						{{ assessment.status }}
					</span>
					<span
						v-if="assessment.type"
						:class="typeColor"
						class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
					>
						{{ assessment.type }}
					</span>
				</div>

				<h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
					{{ assessment.title }}
				</h1>

				<div
					class="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-6"
				>
					<div class="flex items-center space-x-4 mb-4 sm:mb-0">
						<time :datetime="assessment.publishedAt">
							{{ formatDate(assessment.publishedAt) }}
						</time>
						<span v-if="assessment.reviewer" class="border-l pl-4">
							Reviewed by {{ assessment.reviewer }}
						</span>
					</div>
					<div
						v-if="assessment.target && assessment.limit"
						class="text-xs bg-gray-100 px-3 py-1 rounded"
					>
						Target: {{ assessment.target }} | Limit: {{ assessment.limit }}
					</div>
				</div>

				<!-- Author -->
				<div class="mb-8">
					<AssessmentAuthor
						:name="assessment.author"
						:image="'/author.jpg'"
						:twitter-username="assessment.author"
					/>
				</div>
			</header>

			<!-- Content -->
			<article class="prose prose-lg max-w-none mb-12">
				<div v-html="renderedContent" class="markdown-content"></div>
			</article>

			<!-- Footer Actions -->
			<footer class="border-t pt-8">
				<div
					class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
				>
					<button
						@click="goBack"
						class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
					>
						<svg
							class="mr-2 w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Back to Assessments
					</button>

					<div class="flex space-x-2">
						<button
							class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
							title="Share assessment"
						>
							<svg
								class="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
								/>
							</svg>
						</button>
						<button
							class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
							title="Print assessment"
						>
							<svg
								class="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
								/>
							</svg>
						</button>
					</div>
				</div>
			</footer>
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
