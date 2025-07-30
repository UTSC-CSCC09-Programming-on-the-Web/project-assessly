<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { siteConfig } from '@/data/siteConfig';
import HeaderComponent from './components/HeaderComponent.vue';

import { getMe, getSubscriptionStatus } from './services/api-service';


const isSignedIn = ref(true);
const isSubscribed = ref(false);
const router = useRouter();
const route = useRoute();

const isHeaderReady = ref(true);

function handleSignout() {
	isSignedIn.value = false;
	router.push('/');
}

async function refreshSubscriptionStatus() {
	try {
		const result = await getSubscriptionStatus();
		isSubscribed.value = result.isSubscribed;
	} catch (error) {
		console.error('Error refreshing subscription status:', error);
	}
}

onMounted(async () => {
	await getMe()
		.then(async () => {
			isSignedIn.value = true;
			//catch when unauthorized
			await getSubscriptionStatus().then((data) => {
				isSubscribed.value = data.isSubscribed;
				isHeaderReady.value = true;
			}
			).catch((err) => {
				if (err.status === 401) {
					isSubscribed.value = false;
					isHeaderReady.value = true;
				} else {
					alert(err.message);
				}
			});
			const currentPath = route.path;
            if (currentPath === '/') {
                isSubscribed.value ? router.push('recruiter-dashboard') : router.push('candidate-dashboard');
            }
		})
		.catch((er) => {
			isSignedIn.value = false;
			isHeaderReady.value = true;
			router.push('/');
			if (er.status !== 401) {
				alert(er.message);
			}
		});
});

// Watch for route changes to refresh subscription status
watch(() => route.path, async (newPath) => {
	// Refresh subscription status when navigating away from success page
	if (newPath !== '/subscription/success' && isSignedIn.value) {
		await refreshSubscriptionStatus();
	}
});

// Listen for subscription activation event
window.addEventListener('subscription-activated', async () => {
	console.log('🎉 Subscription activated event received, refreshing status...');
	await refreshSubscriptionStatus();
	
	// Force a page reload to ensure all components update
	setTimeout(() => {
		window.location.reload();
	}, 1000);
});
</script>

<template>
	<div id="app" class="min-h-screen bg-gray-50">
		<!-- Navigation -->
		<HeaderComponent
			:is-signed-in="isSignedIn"
			:is-subscribed="isSubscribed"
			@signout="handleSignout"
			v-if="isHeaderReady"
		></HeaderComponent>
		<!-- Main Content -->
		<main class="flex-1">
			<router-view />
		</main>

		<!-- Footer -->
		<footer class="bg-white border-t">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div class="mt-8 pt-8 border-t border-gray-200 text-center">
					<p class="text-gray-500">
						&copy; {{ new Date().getFullYear() }} {{ siteConfig.name }}. Built with
						Vue.js & TypeScript.
					</p>
				</div>
			</div>
		</footer>
	</div>
</template>
