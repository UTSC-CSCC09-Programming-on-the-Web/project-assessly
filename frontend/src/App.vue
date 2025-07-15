<script setup lang="ts">
import {} from "vue";
import { useRoute, useRouter } from "vue-router";
import { siteConfig } from "@/data/siteConfig";

const route = useRoute();
const router = useRouter();

const navigateHome = () => {
  router.push("/");
};
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <button
              @click="navigateHome"
              class="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {{ siteConfig.name }}
            </button>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <router-link
                to="/"
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                :class="
                  route.name === 'Home'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                "
              >
                Home
              </router-link>
              <router-link
                to="/assessments"
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                :class="
                  route.name === 'Assessments' ||
                  route.name === 'AssessmentDetail'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                "
              >
                Assessments
              </router-link>
              <router-link
                to="/live-assistant"
                class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                :class="
                  route.name === 'LiveAssistant'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                "
              >
                AI Assistant
              </router-link>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button
              type="button"
              class="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Brand -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              {{ siteConfig.name }}
            </h3>
            <p class="text-gray-600">{{ siteConfig.description }}</p>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Quick Links
            </h3>
            <ul class="space-y-2">
              <li>
                <router-link
                  to="/"
                  class="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Home
                </router-link>
              </li>
              <li>
                <router-link
                  to="/assessments"
                  class="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Assessments
                </router-link>
              </li>
              <li>
                <router-link
                  to="/live-assistant"
                  class="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  AI Assistant
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Info -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Built With</h3>
            <ul class="space-y-2 text-gray-600">
              <li>Vue.js 3 & TypeScript</li>
              <li>Tailwind CSS</li>
              <li>Vite</li>
              <li>Vue Router</li>
            </ul>
          </div>
        </div>

        <div class="mt-8 pt-8 border-t border-gray-200 text-center">
          <p class="text-gray-500">
            &copy; {{ new Date().getFullYear() }} {{ siteConfig.name }}. Built
            with Vue.js & TypeScript.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Custom active link styling */
.router-link-active {
  @apply bg-blue-100 text-blue-700;
}
</style>
