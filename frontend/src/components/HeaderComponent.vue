<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { siteConfig } from '@/data/siteConfig';

const route = useRoute();
const router = useRouter();

const isSignedIn = ref(false);
const isSubscribed = ref(true);
const routeName = computed(() => route.name);

const navigateHome = () => {
	isSignedIn.value = false;
	router.push('/');
};

const signIn = () => {
	isSignedIn.value = true;
	router.push('/candidate-dashboard');
};
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
						<div v-if="isSignedIn">
							<router-link
								to="/recruiter-dashboard"
								class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
								:class="
									routeName === 'RecruiterDashboard'
										? 'bg-blue-100 text-blue-700'
										: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
								"
								v-if="isSubscribed"
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
								to="/manage-subscription"
								class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
								:class="
									routeName === 'ManageSubscription'
										? 'bg-blue-100 text-blue-700'
										: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
								"
								v-if="isSubscribed"
							>
								Manage Subscription
							</router-link>
							<router-link
								to="/purchase-subscription"
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
							@click="navigateHome"
							v-if="isSignedIn"
						>
							Sign out
						</button>
						<button
							class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
							@click="signIn"
							v-else
						>
							Sign in with Google
						</button>
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
