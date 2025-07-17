<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Assessment } from '@/types/assessment';

interface Props {
	data: Assessment;
	role: 'recruiter' | 'candidate';
	status?: string;
	sent_to?: number;
	completed_by?: number;
	score?: number;
	time_taken?: number;
}

const props = defineProps<Props>();
const router = useRouter();

const handleClick = () => {
	if (props.role === 'recruiter') {
		router.push(`/recruiter-dashboard/${props.data.id}/details`);
	} else {
		router.push(`/candidate-dashboard/${props.data.id}/details`);
	}
};
</script>

<template>
	<div class="block cursor-pointer group" @click="handleClick">
		<div
			class="h-full bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md overflow-hidden flex flex-col"
		>
			<div class="p-6">
				<!-- Header -->
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
						{{ data.title }}
					</h3>
					<!-- Right side of header -->
					<div v-if="role === 'recruiter'" class="flex gap-2">
						<button
							class="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 transition"
						>
							<img src="@/media/bin.png" alt="Delete" class="w-4 h-4" />
						</button>
					</div>
					<div v-else class="flex gap-2">
						<span
							class="px-3 py-1 rounded-full text-xs font-semibold"
							:class="{
								'bg-green-100 text-green-800': status === 'Done',
								'bg-yellow-100 text-yellow-800': status === 'In Progress',
								'bg-red-100 text-red-800': status === 'Not Completed',
							}"
						>
							{{ status }}
						</span>
					</div>
				</div>

				<!-- Summary -->
				<p class="text-gray-600 mb-4 line-clamp-5 min-h-[7.5rem]">
					{{ data.summary }}
				</p>

				<!-- Stats area -->
				<div class="flex justify-between items-start mb-4 text-sm text-gray-700">
					<template v-if="role === 'recruiter'">
						<!-- Recruiter view -->
						<div class="flex flex-col items-center text-center">
							<span class="text-xs text-gray-500">Sent to</span>
							<span class="text-2xl font-bold text-gray-900">{{ sent_to != null ? sent_to : 'N/A' }}</span>
						</div>
						<div class="flex flex-col items-center text-center">
							<span class="text-xs text-gray-500">Completed by</span>
							<span class="text-2xl font-bold text-gray-900">{{ completed_by != null ? completed_by : 'N/A' }}</span>
						</div>
					</template>
					<template v-else>
						<!-- Candidate view -->
						<div class="flex flex-col items-center text-center">
							<span class="text-xs text-gray-500">Your Score</span>
							<span class="text-2xl font-bold text-gray-900">
								{{ score != null ? score : 'N/A' }}
							</span>
						</div>
						<div class="flex flex-col items-center text-center">
							<span class="text-xs text-gray-500">Time Taken</span>
							<span class="text-2xl font-bold text-gray-900">
							{{ time_taken != null ? time_taken : 'N/A' }}
							</span>
						</div>
					</template>
				</div>

				<!-- Footer -->
				<div class="flex items-center justify-between text-sm text-gray-500">
					<div class="flex items-center">
						<span class="font-medium">From {{ data.author }}</span>
					</div>
					<div v-if="data.deadline" class="flex items-center">
						<span class="font-medium">Deadline: {{ data.deadline }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>