<template>
	<div class="min-h-screen bg-gray-50 py-8">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-3xl font-bold text-gray-900">Manage Subscription</h1>
				<p class="mt-2 text-gray-600">Manage your billing information and subscription settings</p>
			</div>

			<!-- Loading State -->
			<div v-if="loading" class="flex justify-center items-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>

			<!-- Error State -->
			<div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
				<div class="flex">
					<div class="flex-shrink-0">
						<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">Error loading subscription details</h3>
						<div class="mt-2 text-sm text-red-700">{{ error }}</div>
					</div>
				</div>
			</div>

			<!-- Subscription Details -->
			<div v-else-if="subscriptionDetails" class="space-y-6">
				<!-- Current Plan -->
				<div class="bg-white shadow rounded-lg p-6">
					<h2 class="text-lg font-medium text-gray-900 mb-4">Current Plan</h2>
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-900">Recruiter Pro</p>
							<p class="text-sm text-gray-500">Full access to all features</p>
						</div>
						<div class="text-right">
							<p class="text-lg font-semibold text-gray-900">$29/month</p>
							<p class="text-sm text-gray-500">
								{{ subscriptionDetails.subscription ? 'Active' : 'Inactive' }}
							</p>
						</div>
					</div>
				</div>

				<!-- Billing Information -->
				<div class="bg-white shadow rounded-lg p-6">
					<h2 class="text-lg font-medium text-gray-900 mb-4">Billing Information</h2>
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-gray-700">Email</label>
							<p class="mt-1 text-sm text-gray-900">{{ subscriptionDetails.customer?.email }}</p>
						</div>
						<div v-if="subscriptionDetails.customer?.name">
							<label class="block text-sm font-medium text-gray-700">Name</label>
							<p class="mt-1 text-sm text-gray-900">{{ subscriptionDetails.customer.name }}</p>
						</div>
					</div>
				</div>

				<!-- Payment Methods -->
				<div v-if="subscriptionDetails.paymentMethods?.length > 0" class="bg-white shadow rounded-lg p-6">
					<h2 class="text-lg font-medium text-gray-900 mb-4">Payment Methods</h2>
					<div class="space-y-3">
						<div 
							v-for="method in subscriptionDetails.paymentMethods" 
							:key="method.id"
							class="flex items-center justify-between p-3 border border-gray-200 rounded-md"
						>
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
									</svg>
								</div>
								<div class="ml-3">
									<p class="text-sm font-medium text-gray-900">
										•••• •••• •••• {{ method.card?.last4 }}
									</p>
									<p class="text-sm text-gray-500">
										Expires {{ method.card?.exp_month }}/{{ method.card?.exp_year }}
									</p>
								</div>
							</div>
							<div v-if="method.id === subscriptionDetails.subscription?.default_payment_method" class="text-sm text-green-600 font-medium">
								Default
							</div>
						</div>
					</div>
				</div>

				<!-- Subscription Status -->
				<div v-if="subscriptionDetails.subscription" class="bg-white shadow rounded-lg p-6">
					<h2 class="text-lg font-medium text-gray-900 mb-4">Subscription Details</h2>
					<div class="space-y-4">
						<div class="flex justify-between">
							<span class="text-sm text-gray-500">Status</span>
							<span class="text-sm font-medium text-gray-900 capitalize">
								{{ subscriptionDetails.subscription.status }}
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-gray-500">Next billing date</span>
							<span class="text-sm font-medium text-gray-900">
								{{ formatDate(subscriptionDetails.subscription.current_period_end) }}
							</span>
						</div>
						<div v-if="subscriptionDetails.subscription.cancel_at_period_end" class="flex justify-between">
							<span class="text-sm text-gray-500">Cancelation date</span>
							<span class="text-sm font-medium text-red-600">
								{{ formatDate(subscriptionDetails.subscription.cancel_at) }}
							</span>
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="bg-white shadow rounded-lg p-6">
					<h2 class="text-lg font-medium text-gray-900 mb-4">Actions</h2>
					<div class="space-y-3">
						<button 
							@click="openCustomerPortal"
							class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
							:disabled="portalLoading"
						>
							<span v-if="portalLoading" class="flex items-center justify-center">
								<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								Loading...
							</span>
							<span v-else>Manage Billing</span>
						</button>
						
						<button 
							v-if="subscriptionDetails.subscription && !subscriptionDetails.subscription.cancel_at_period_end"
							@click="cancelSubscription"
							class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
							:disabled="cancelLoading"
						>
							<span v-if="cancelLoading" class="flex items-center justify-center">
								<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								Canceling...
							</span>
							<span v-else>Cancel Subscription</span>
						</button>
						
						<button 
							v-if="subscriptionDetails.subscription?.cancel_at_period_end"
							@click="reactivateSubscription"
							class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
						>
							Reactivate Subscription
						</button>
					</div>
				</div>
			</div>

			<!-- No Subscription -->
			<div v-else class="bg-white shadow rounded-lg p-6 text-center">
				<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
					<svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
				</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
				<p class="text-gray-500 mb-4">You don't have an active subscription. Subscribe to access recruiter features.</p>
				<router-link 
					to="/subscription/purchase"
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
				>
					Subscribe Now
				</router-link>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getSubscriptionDetails, createPortalSession, cancelSubscription } from '@/services/api-service';

const router = useRouter();
const loading = ref(true);
const portalLoading = ref(false);
const cancelLoading = ref(false);
const error = ref('');
const subscriptionDetails = ref(null);

async function loadSubscriptionDetails() {
	try {
		loading.value = true;
		error.value = '';
		const details = await getSubscriptionDetails();
		subscriptionDetails.value = details;
	} catch (err) {
		console.error('Error loading subscription details:', err);
		error.value = err.message || 'Failed to load subscription details';
	} finally {
		loading.value = false;
	}
}

async function openCustomerPortal() {
	try {
		portalLoading.value = true;
		const result = await createPortalSession();
		
		if (result.fallback) {
			// Portal not configured, show instructions
			alert('Customer portal not configured. Please configure the Stripe Customer Portal in your dashboard at: https://dashboard.stripe.com/test/settings/billing/portal');
		} else {
			window.location.href = result.url;
		}
	} catch (err) {
		console.error('Error opening customer portal:', err);
		
		if (err.status === 503) {
			alert('Customer portal not configured. Please configure the Stripe Customer Portal in your dashboard at: https://dashboard.stripe.com/test/settings/billing/portal');
		} else {
			alert('Failed to open billing portal. Please try again.');
		}
	} finally {
		portalLoading.value = false;
	}
}

async function cancelSubscription() {
	if (!confirm('Are you sure you want to cancel your subscription? You will lose access to recruiter features at the end of your current billing period.')) {
		return;
	}

	try {
		cancelLoading.value = true;
		await cancelSubscription();
		alert('Your subscription has been canceled and will end at the conclusion of your current billing period.');
		await loadSubscriptionDetails(); // Refresh the data
	} catch (err) {
		console.error('Error canceling subscription:', err);
		alert('Failed to cancel subscription. Please try again.');
	} finally {
		cancelLoading.value = false;
	}
}

function reactivateSubscription() {
	// This would typically open the customer portal to reactivate
	openCustomerPortal();
}

function formatDate(timestamp: number): string {
	return new Date(timestamp * 1000).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

onMounted(() => {
	loadSubscriptionDetails();
});
</script>
