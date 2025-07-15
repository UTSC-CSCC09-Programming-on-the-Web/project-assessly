<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAssessments } from "@/composables/useAssessments";
import { siteConfig } from "@/data/siteConfig";
import AssessmentCard from "@/components/AssessmentCard.vue";
import LiveAssistant from "@/components/LiveAssistant.vue";

const router = useRouter();
const { assessments, stats } = useAssessments();

// Get latest 3 assessments for preview
const latestAssessments = computed(() => {
  return assessments.value.slice(0, 3);
});

const navigateToAssessments = () => {
  router.push("/assessments");
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to
            <span class="text-blue-600">{{ siteConfig.name }}</span>
          </h1>
          <p class="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            {{ siteConfig.description }}
          </p>
          <div class="mt-10">
            <button
              @click="navigateToAssessments"
              class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              View All Assessments
              <svg
                class="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="bg-blue-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900">Assessment Overview</h2>
          <p class="mt-4 text-lg text-gray-600">
            Current status of all assessments
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="bg-white rounded-lg p-6 text-center shadow-sm">
            <div class="text-3xl font-bold text-blue-600 mb-2">
              {{ stats.total }}
            </div>
            <div class="text-gray-600">Total Assessments</div>
          </div>
          <div class="bg-white rounded-lg p-6 text-center shadow-sm">
            <div class="text-3xl font-bold text-green-600 mb-2">
              {{ stats.done }}
            </div>
            <div class="text-gray-600">Completed</div>
          </div>
          <div class="bg-white rounded-lg p-6 text-center shadow-sm">
            <div class="text-3xl font-bold text-yellow-600 mb-2">
              {{ stats.inProcess }}
            </div>
            <div class="text-gray-600">In Progress</div>
          </div>
          <div class="bg-white rounded-lg p-6 text-center shadow-sm">
            <div class="text-3xl font-bold text-blue-600 mb-2">
              {{ stats.completionRate }}%
            </div>
            <div class="text-gray-600">Completion Rate</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest Assessments Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900">Latest Assessments</h2>
          <p class="mt-4 text-lg text-gray-600">
            Recent additions to our assessment collection
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <AssessmentCard
            v-for="(assessment, index) in latestAssessments"
            :key="assessment.slug"
            :data="assessment"
            :priority="index < 2"
          />
        </div>

        <div class="text-center">
          <button
            @click="navigateToAssessments"
            class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            View All Assessments
            <svg
              class="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Live Assistant Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900">AI Live Assistant</h2>
          <p class="mt-4 text-lg text-gray-600">
            Get instant help with assessments using our AI-powered assistant
          </p>
        </div>

        <LiveAssistant />
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900">Why Choose Assessly?</h2>
          <p class="mt-4 text-lg text-gray-600">
            Modern assessment platform built for efficiency
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="text-center">
            <div
              class="bg-blue-100 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center"
            >
              <svg
                class="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Quality Assurance
            </h3>
            <p class="text-gray-600">
              Comprehensive review process ensures high-quality assessments
            </p>
          </div>

          <div class="text-center">
            <div
              class="bg-green-100 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center"
            >
              <svg
                class="w-8 h-8 text-green-600"
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
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Fast & Efficient
            </h3>
            <p class="text-gray-600">
              Built with modern technology for optimal performance
            </p>
          </div>

          <div class="text-center">
            <div
              class="bg-purple-100 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center"
            >
              <svg
                class="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              User-Friendly
            </h3>
            <p class="text-gray-600">
              Intuitive interface designed for ease of use
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
