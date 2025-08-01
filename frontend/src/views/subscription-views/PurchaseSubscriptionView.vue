<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { startStripeCheckoutSession } from '@/services/api-service';

const loading = ref(false);
const error = ref('');

const redirectToStripe = async () => {
  try {
    loading.value = true;
    error.value = '';
    const data = await startStripeCheckoutSession();
    if (data.url) {
      window.location.href = data.url;
    }
  } catch (err) {
    console.error('Error creating checkout session:', err);
    error.value = err.message || 'Failed to create checkout session';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  redirectToStripe();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <h2 class="text-2xl font-semibold mb-4">Setting up your subscription...</h2>
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Redirecting to secure payment page</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg shadow-lg p-6 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Payment Setup Failed</h3>
        <p class="text-gray-500 mb-4">{{ error }}</p>
        <button 
          @click="redirectToStripe"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>

      <!-- Success State (shouldn't normally show) -->
      <div v-else class="bg-white rounded-lg shadow-lg p-6 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Ready to Subscribe</h3>
        <p class="text-gray-500 mb-4">Click below to start your subscription</p>
        <button 
          @click="redirectToStripe"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Start Subscription
        </button>
      </div>
    </div>
  </div>
</template>