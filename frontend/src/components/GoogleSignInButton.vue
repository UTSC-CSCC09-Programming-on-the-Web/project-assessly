<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();

async function onSigninClick() {
    router.push('/candidate-dashboard');
}
</script>

<template>
	<button
		class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
		@click="onSigninClick"
		>
		Sign in with Google
	</button>
</template>
