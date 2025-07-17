<script setup lang="ts">
import { computed } from 'vue';
import { formatDate } from '@/utils/assessments';

interface Props {
	name: string;
	image: string;
	twitterUsername?: string;
	updatedAt?: string;
	imageOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	twitterUsername: undefined,
	updatedAt: undefined,
	imageOnly: false,
});

const isExternalLink = computed(() => {
	return props.twitterUsername && !props.imageOnly;
});

const twitterUrl = computed(() => {
	return props.twitterUsername ? `https://twitter.com/${props.twitterUsername}` : undefined;
});
</script>

<template>
	<!-- Image only variant -->
	<img
		v-if="imageOnly"
		:src="image"
		:alt="name"
		class="w-9 h-9 rounded-full transition-all group-hover:brightness-90"
	/>

	<!-- Updated at variant -->
	<div v-else-if="updatedAt" class="flex items-center space-x-3">
		<img :src="image" :alt="name" class="w-9 h-9 rounded-full" />
		<div class="flex flex-col">
			<p class="text-sm text-gray-500">Written by {{ name }}</p>
			<time :datetime="updatedAt" class="text-sm font-light text-gray-400">
				Last updated {{ formatDate(updatedAt) }}
			</time>
		</div>
	</div>

	<!-- Default variant with optional Twitter link -->
	<component
		v-else
		:is="isExternalLink ? 'a' : 'div'"
		:href="twitterUrl"
		:target="isExternalLink ? '_blank' : undefined"
		:rel="isExternalLink ? 'noopener noreferrer' : undefined"
		:class="[
			'flex items-center space-x-3',
			isExternalLink ? 'group hover:opacity-90 transition-opacity' : '',
		]"
	>
		<img
			:src="image"
			:alt="name"
			class="w-10 h-10 rounded-full transition-all group-hover:brightness-90"
		/>
		<div class="flex flex-col">
			<p class="font-semibold text-gray-700">{{ name }}</p>
			<p v-if="twitterUsername" class="text-sm text-gray-500">@{{ twitterUsername }}</p>
		</div>
		<!-- External link icon -->
		<svg
			v-if="isExternalLink"
			class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
			/>
		</svg>
	</component>
</template>
