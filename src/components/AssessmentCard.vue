<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Assessment } from '@/types/assessment'
import { formatDate } from '@/utils/assessments'

interface Props {
  data: Assessment
  priority?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  priority: false
})

const router = useRouter()

const statusColor = computed(() => {
  switch (props.data.status) {
    case 'Done':
      return 'bg-green-100 text-green-800'
    case 'In Process':
      return 'bg-yellow-100 text-yellow-800'
    case 'Pending':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
})

const typeColor = computed(() => {
  switch (props.data.type) {
    case 'Technical content':
      return 'bg-purple-100 text-purple-800'
    case 'Narrative':
      return 'bg-blue-100 text-blue-800'
    case 'Legal':
      return 'bg-red-100 text-red-800'
    case 'Research':
      return 'bg-indigo-100 text-indigo-800'
    case 'Visual':
      return 'bg-pink-100 text-pink-800'
    case 'Financial':
      return 'bg-emerald-100 text-emerald-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const handleClick = () => {
  router.push(`/assessments/${props.data.slug}`)
}
</script>

<template>
  <div 
    class="block cursor-pointer group"
    @click="handleClick"
  >
    <div class="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md overflow-hidden">
      <!-- Image -->
      <div v-if="data.image" class="aspect-video w-full overflow-hidden">
        <img
          :src="data.image"
          :alt="data.title"
          :loading="priority ? 'eager' : 'lazy'"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div v-else class="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div class="text-gray-400 text-4xl">
          📄
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Meta information -->
        <div class="flex items-center justify-between mb-3">
          <time 
            :datetime="data.publishedAt"
            class="text-sm text-gray-500"
          >
            {{ formatDate(data.publishedAt) }}
          </time>
          <div class="flex gap-2">
            <span 
              v-if="data.status"
              :class="statusColor"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            >
              {{ data.status }}
            </span>
            <span 
              v-if="data.type"
              :class="typeColor"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            >
              {{ data.type }}
            </span>
          </div>
        </div>

        <!-- Title and Summary -->
        <h3 class="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
          {{ data.title }}
        </h3>
        <p class="text-gray-600 mb-4 line-clamp-3">
          {{ data.summary }}
        </p>

        <!-- Footer -->
        <div class="flex items-center justify-between text-sm text-gray-500">
          <div class="flex items-center">
            <span class="font-medium">{{ data.author }}</span>
            <span v-if="data.reviewer" class="ml-2">
              • Reviewed by {{ data.reviewer }}
            </span>
          </div>
          <div v-if="data.target && data.limit" class="text-xs">
            Target: {{ data.target }} | Limit: {{ data.limit }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 