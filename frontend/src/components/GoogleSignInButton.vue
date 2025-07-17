<script setup lang="ts">
import { getOauthUrl } from '@/services/api-service';

async function onSigninClick() {
	await getOauthUrl().then((res: { url: string }) => {
		window.location.href = res.url;
	});
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
