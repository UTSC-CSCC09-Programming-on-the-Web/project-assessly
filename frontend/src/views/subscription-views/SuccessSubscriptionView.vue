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
        You successfully completed your checkout and should now have access to the recruiter dashboard.
      </p>


      <!-- Additional Info -->
      <p class="text-sm text-gray-500 mt-6">
        If you don't see your subscription activated immediately, please refresh the page or contact support.
      </p>
    </div>
  </div>
</template>