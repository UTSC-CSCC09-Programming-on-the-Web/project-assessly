<script setup lang="ts">
import { onMounted } from 'vue';
import { startStripeCheckoutSession } from '@/services/api-service';

const redirectToStripe = async () => {
  try {
    await startStripeCheckoutSession().then(data => {
      if (data.url) {
        window.location.href = data.url;
      }
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
  }
};

onMounted(() => {
  redirectToStripe();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <h2 class="text-2xl font-semibold mb-4">Redirecting to Stripe...</h2>
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
    </div>
  </div>
</template>