<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { siteConfig } from '@/data/siteConfig';
import GoogleSignInButton from './GoogleSignInButton.vue';
import { signOut } from '@/services/api-service';

const props = defineProps<{
	isSignedIn: boolean;
	isSubscribed: boolean;
}>();
const emit = defineEmits(['signout']);

const route = useRoute();
const router = useRouter();

async function onSignoutClick() {
	await signOut()
		.then(() => emit('signout'))
		.catch((er) => alert(er.message));
}

const getIsSignedIn = computed(() => props.isSignedIn);

const getIsSubscribed = computed(() => props.isSubscribed);

const routeName = computed(() => route.name);
</script>

<template>
	<nav class="bg-white shadow-sm border-b sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<!-- Logo -->
				<div class="flex-shrink-0">
					<h1
						class="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
					>
						{{ siteConfig.name }}
					</h1>
				</div>

				<!-- Navigation Links -->
				<div class="hidden md:block">
					<div class="ml-10 flex items-baseline space-x-4">
						<div v-if="getIsSignedIn">
							<router-link
								to="/recruiter-dashboard"
								class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
								:class="
									routeName === 'RecruiterDashboard'
										? 'bg-blue-100 text-blue-700'
										: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
								"
								v-if="getIsSubscribed"
							>
								Recruiter Dashboard
							</router-link>
							<router-link
								to="/candidate-dashboard"
								class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
								:class="
									routeName === 'CandidateDashboard'
										? 'bg-blue-100 text-blue-700'
										: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
								"
							>
								Candidate Dashboard
							</router-link>
							<router-link
								to="/subscription/manage"
								class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
								:class="
									routeName === 'ManageSubscription'
										? 'bg-blue-100 text-blue-700'
										: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
								"
								v-if="getIsSubscribed"
							>
								Manage Subscription
							</router-link>
							<router-link
								to="/subscription/purchase"
								class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
								:class="
									routeName === 'PurchaseSubscription'
										? 'bg-blue-100 text-blue-700'
										: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
								"
								v-else
							>
								Become a Recruiter
							</router-link>
						</div>

						<button
							class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
							@click="onSignoutClick"
							v-if="getIsSignedIn"
						>
							Sign out
						</button>
						<GoogleSignInButton v-else> </GoogleSignInButton>
					</div>
				</div>

				<!-- Mobile menu button -->
				<div class="md:hidden">
					<button
						type="button"
						class="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
						aria-expanded="false"
					>
						<span class="sr-only">Open main menu</span>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	</nav>
</template>
