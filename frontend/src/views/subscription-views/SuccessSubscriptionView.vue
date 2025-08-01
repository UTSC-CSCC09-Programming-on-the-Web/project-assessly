<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <!-- Success Icon -->
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>

      <!-- Title and Message -->
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
      <p class="text-gray-600 mb-8">
        {{ statusMessage }}
      </p>

      <!-- Loading Spinner -->
      <div v-if="isChecking" class="flex justify-center mb-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Action Buttons -->
      <div v-if="!isChecking" class="space-y-3">
        <button 
          @click="goToRecruiterDashboard" 
          class="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          v-if="isSubscribed"
        >
          Go to Recruiter Dashboard
        </button>
        <button 
          @click="checkSubscriptionStatus" 
          class="w-full bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
          v-else-if="!authError"
        >
          Check Subscription Status
        </button>
        <button 
          @click="signInAgain" 
          class="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          v-if="authError"
        >
          Sign In Again
        </button>
        <button 
          @click="manualActivate" 
          class="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors mt-2"
          v-if="!isSubscribed && !authError"
        >
          Manual Activate (Testing)
        </button>
      </div>

      <!-- Additional Info -->
      <p class="text-sm text-gray-500 mt-6">
        If you don't see your subscription activated immediately, please try the check button above or contact support.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getSubscriptionStatus, verifyCheckout } from '@/services/api-service';

const router = useRouter();
const route = useRoute();
const isChecking = ref(true);
const isSubscribed = ref(false);
const authError = ref(false);
const statusMessage = ref('Verifying your subscription status...');

async function checkSubscriptionStatus() {
  isChecking.value = true;
  statusMessage.value = 'Checking subscription status...';
  
  try {
    const result = await getSubscriptionStatus();
    isSubscribed.value = result.isSubscribed;
    
    if (result.isSubscribed) {
      statusMessage.value = 'Great! Your subscription is now active. You have access to the recruiter dashboard.';
    } else {
      statusMessage.value = 'Your subscription is still being processed. Please wait a moment and try again.';
    }
  } catch (error) {
    console.error('Error checking subscription:', error);
    
    if (error.status === 401) {
      statusMessage.value = 'Authentication required. Please sign in again to check your subscription status.';
      authError.value = true;
    } else {
      statusMessage.value = 'There was an error checking your subscription status. Please try again.';
    }
  } finally {
    isChecking.value = false;
  }
}

function goToRecruiterDashboard() {
  // Emit an event to notify parent that subscription is active
  window.dispatchEvent(new CustomEvent('subscription-activated'));
  router.push('/recruiter-dashboard');
}

function signInAgain() {
  // Redirect to home page to sign in again
  router.push('/');
}

async function manualActivate() {
  isChecking.value = true;
  statusMessage.value = 'Manually activating subscription...';
  
  try {
    // Get the current user's email from the session
    const response = await fetch('/api/oauth/me');
    const userData = await response.json();
    
    if (userData.email) {
      // Call the test endpoint to manually set subscription
      const activateResponse = await fetch('/api/stripe/test-set-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userData.email }),
      });
      
      const result = await activateResponse.json();
      
      if (activateResponse.ok) {
        isSubscribed.value = true;
        statusMessage.value = 'Subscription manually activated! You now have access to the recruiter dashboard.';
      } else {
        statusMessage.value = `Error: ${result.error}`;
      }
    } else {
      statusMessage.value = 'Could not get user email. Please try signing in again.';
    }
  } catch (error) {
    console.error('Error manually activating:', error);
    statusMessage.value = 'Error manually activating subscription. Please try again.';
  } finally {
    isChecking.value = false;
  }
}

onMounted(async () => {
  // Check if we have a session_id in the URL (from Stripe redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId) {
    console.log('🎯 Stripe session detected, verifying checkout...');
    await verifyCheckoutSession(sessionId);
  } else {
    // Check subscription status immediately when page loads
    await checkSubscriptionStatus();
  }
});

async function verifyCheckoutSession(sessionId: string) {
  isChecking.value = true;
  statusMessage.value = 'Verifying your payment...';
  
  try {
    console.log('🔍 Verifying checkout session:', sessionId);
    const result = await verifyCheckout(sessionId);
    
    if (result.success) {
      console.log('✅ Checkout verified successfully:', result);
      isSubscribed.value = result.user.isSubscribed;
      statusMessage.value = 'Payment verified! Your subscription is now active.';
      
      // Clean up URL to remove session_id
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Emit event to notify parent that subscription is active
      window.dispatchEvent(new CustomEvent('subscription-activated'));
    } else {
      statusMessage.value = 'Payment verification failed. Please contact support.';
    }
  } catch (error) {
    console.error('❌ Error verifying checkout:', error);
    
    if (error.message?.includes('Session already verified')) {
      console.warn('Session already verified - ignoring duplicate verification call');
      statusMessage.value = 'Payment already verified. Your subscription is active.';
      isSubscribed.value = true;
    } else {
      statusMessage.value = 'Payment verification failed. Please try again or contact support.';
    }
  } finally {
    isChecking.value = false;
  }
}
</script>