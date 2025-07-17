<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { siteConfig } from '@/data/siteConfig';
import HeaderComponent from './components/HeaderComponent.vue';
import { getMe } from './services/api-service';

const isSignedIn = ref(true);
const isSubscribed = ref(true);
const router = useRouter();

const isHeaderReady = ref(true);

function handleSignout() {
	isSignedIn.value = false;
	router.push('/');
}

// onMounted(async () => {
// 	await getMe()
// 		.then(() => {
// 			isSignedIn.value = true;
// 			isHeaderReady.value = true;
// 			router.push('candidate-dashboard');
// 		})
// 		.catch((er) => {
// 			isSignedIn.value = false;
// 			isHeaderReady.value = true;
// 			router.push('/');
// 			if (er.status !== 401) {
// 				alert(er.message);
// 			}
// 		});
// });
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
