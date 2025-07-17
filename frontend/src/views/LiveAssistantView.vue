<template>
	<div class="min-h-screen bg-gray-50 py-8">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<!-- Header -->
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-gray-900 mb-4">AI Live Assistant</h1>
				<p class="text-lg text-gray-600 max-w-2xl mx-auto">
					Experience real-time AI conversations with voice and text. Get instant help with
					your assessments, study guidance, and answers to your questions.
				</p>
			</div>

			<!-- Live Assistant Component -->
			<LiveAssistant />

			<!-- Information Section -->
			<div class="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				<div class="bg-white rounded-lg p-6 shadow-sm">
					<div class="flex items-center mb-4">
						<div class="bg-blue-100 rounded-lg p-2 mr-3">
							<svg
								class="w-6 h-6 text-blue-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
								/>
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-gray-900">Voice Conversations</h3>
					</div>
					<p class="text-gray-600">
						Use your microphone to have natural voice conversations with the AI. The
						assistant can hear you and respond with natural speech.
					</p>
				</div>

				<div class="bg-white rounded-lg p-6 shadow-sm">
					<div class="flex items-center mb-4">
						<div class="bg-green-100 rounded-lg p-2 mr-3">
							<svg
								class="w-6 h-6 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-gray-900">Assessment Help</h3>
					</div>
					<p class="text-gray-600">
						Get instant help with finding assessments, understanding requirements, and
						study guidance tailored to your needs.
					</p>
				</div>

				<div class="bg-white rounded-lg p-6 shadow-sm">
					<div class="flex items-center mb-4">
						<div class="bg-purple-100 rounded-lg p-2 mr-3">
							<svg
								class="w-6 h-6 text-purple-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-gray-900">Real-time Responses</h3>
					</div>
					<p class="text-gray-600">
						Powered by Google's Gemini 2.0, experience lightning-fast responses with
						advanced reasoning and multimodal capabilities.
					</p>
				</div>
			</div>

			<!-- Getting Started -->
			<div class="mt-12 bg-white rounded-lg p-8 shadow-sm">
				<h3 class="text-xl font-bold text-gray-900 mb-4">Getting Started</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div>
						<h4 class="font-semibold text-gray-900 mb-2">Prerequisites</h4>
						<ul class="text-gray-600 space-y-1">
							<li>• Google AI API key (free to get)</li>
							<li>• Modern web browser with microphone access</li>
							<li>• Stable internet connection</li>
						</ul>
					</div>
					<div>
						<h4 class="font-semibold text-gray-900 mb-2">Quick Tips</h4>
						<ul class="text-gray-600 space-y-1">
							<li>• Speak clearly for better voice recognition</li>
							<li>• Ask specific questions about assessments</li>
							<li>• Use both voice and text as needed</li>
							<li>• Check the activity log for debugging</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import LiveAssistant from '@/components/LiveAssistant.vue';
</script>
