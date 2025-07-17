<script setup lang="ts">
import { siteConfig } from '@/data/siteConfig';
import HeaderComponent from './components/HeaderComponent.vue';
</script>

<template>
	<div id="app" class="min-h-screen bg-gray-50">
		<!-- Navigation -->
		<HeaderComponent></HeaderComponent>
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
