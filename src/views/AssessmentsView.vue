<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAssessments, useAssessmentMeta } from '@/composables/useAssessments'
import { siteConfig } from '@/data/siteConfig'
import AssessmentCard from '@/components/AssessmentCard.vue'

const { 
  assessments, 
  loading, 
  error, 
  filters,
  currentPage,
  totalPages,
  totalAssessments,
  stats,
  setFilters,
  clearFilters,
  setPage,
  nextPage,
  prevPage
} = useAssessments()

const { types, statuses, authors } = useAssessmentMeta()

// Local filter state
const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const selectedAuthor = ref('')

// Apply filters
const applyFilters = () => {
  setFilters({
    searchQuery: searchQuery.value || undefined,
    type: selectedType.value || undefined,
    status: selectedStatus.value || undefined,
    author: selectedAuthor.value || undefined,
  })
}

// Clear all filters
const handleClearFilters = () => {
  searchQuery.value = ''
  selectedType.value = ''
  selectedStatus.value = ''
  selectedAuthor.value = ''
  clearFilters()
}

// Watch for changes and apply filters
const handleSearch = () => {
  applyFilters()
}

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedType.value || selectedStatus.value || selectedAuthor.value
})

const isEmpty = computed(() => {
  return !loading.value && assessments.value.length === 0
})

// Pagination helpers
const pageNumbers = computed(() => {
  const pages = []
  const maxPagesToShow = 5
  const start = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2))
  const end = Math.min(totalPages.value, start + maxPagesToShow - 1)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 sm:text-4xl">
            Assessments
          </h1>
          <p class="mt-4 text-xl text-gray-600">
            Latest assessments and insights from {{ siteConfig.name }}
          </p>
        </div>
      </div>
    </header>

    <!-- Stats Bar -->
    <section class="bg-blue-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ stats.total }}</div>
            <div class="text-sm text-gray-600">Total</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ stats.done }}</div>
            <div class="text-sm text-gray-600">Completed</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-yellow-600">{{ stats.inProcess }}</div>
            <div class="text-sm text-gray-600">In Progress</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ stats.completionRate }}%</div>
            <div class="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <section class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Search -->
          <div class="lg:col-span-2">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search assessments..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                @input="handleSearch"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Type Filter -->
          <div>
            <select
              v-model="selectedType"
              class="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              @change="applyFilters"
            >
              <option value="">All Types</option>
              <option v-for="type in types" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <select
              v-model="selectedStatus"
              class="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              @change="applyFilters"
            >
              <option value="">All Statuses</option>
              <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
            </select>
          </div>

          <!-- Clear Filters -->
          <div class="flex items-end">
            <button
              v-if="hasActiveFilters"
              @click="handleClearFilters"
              class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">{{ error }}</div>
        <button
          @click="handleClearFilters"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="isEmpty" class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">📄</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
        <p class="text-gray-600 mb-4">
          {{ hasActiveFilters ? 'Try adjusting your search filters.' : 'No assessments are available yet.' }}
        </p>
        <button
          v-if="hasActiveFilters"
          @click="handleClearFilters"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      <!-- Assessment Grid -->
      <div v-else>
        <!-- Results Info -->
        <div class="mb-6 text-sm text-gray-600">
          Showing {{ assessments.length }} of {{ totalAssessments }} assessments
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <AssessmentCard
            v-for="(assessment, index) in assessments"
            :key="assessment.slug"
            :data="assessment"
            :priority="index < 3"
          />
        </div>

        <!-- Pagination -->
        <nav v-if="totalPages > 1" class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              :disabled="currentPage <= 1"
              @click="prevPage"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              :disabled="currentPage >= totalPages"
              @click="nextPage"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Page {{ currentPage }} of {{ totalPages }}
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  :disabled="currentPage <= 1"
                  @click="prevPage"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <button
                  v-for="page in pageNumbers"
                  :key="page"
                  @click="setPage(page)"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
                
                <button
                  :disabled="currentPage >= totalPages"
                  @click="nextPage"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </nav>
      </div>
    </main>
  </div>
</template> 