import { ref, computed, readonly, type Ref } from 'vue'
import type { Assessment, AssessmentFilters, AssessmentListOptions } from '@/types/assessment'
import { 
  getAssessments, 
  getAssessment, 
  getAssessmentTypes, 
  getAssessmentStatuses,
  getAuthors,
  getAssessmentStats
} from '@/utils/assessments'

export function useAssessments() {
  // Reactive state
  const assessments: Ref<Assessment[]> = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters: Ref<AssessmentFilters> = ref({})
  const currentPage = ref(1)
  const itemsPerPage = ref(6)

  // Computed properties
  const filteredAssessments = computed(() => {
    return getAssessments({
      filters: filters.value,
      page: currentPage.value,
      limit: itemsPerPage.value
    })
  })

  const totalAssessments = computed(() => {
    return getAssessments({ filters: filters.value }).length
  })

  const totalPages = computed(() => {
    return Math.ceil(totalAssessments.value / itemsPerPage.value)
  })

  const stats = computed(() => getAssessmentStats())

  // Actions
  const loadAssessments = async (options?: AssessmentListOptions) => {
    loading.value = true
    error.value = null
    
    try {
      assessments.value = getAssessments(options)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load assessments'
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: AssessmentFilters) => {
    filters.value = { ...newFilters }
    currentPage.value = 1 // Reset to first page when filters change
  }

  const clearFilters = () => {
    filters.value = {}
    currentPage.value = 1
  }

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const nextPage = () => {
    setPage(currentPage.value + 1)
  }

  const prevPage = () => {
    setPage(currentPage.value - 1)
  }

  // Initialize
  loadAssessments()

  return {
    // State
    assessments: filteredAssessments,
    loading: readonly(loading),
    error: readonly(error),
    filters: readonly(filters),
    currentPage: readonly(currentPage),
    itemsPerPage: readonly(itemsPerPage),
    
    // Computed
    totalAssessments,
    totalPages,
    stats,
    
    // Actions
    loadAssessments,
    setFilters,
    clearFilters,
    setPage,
    nextPage,
    prevPage
  }
}

export function useAssessment(slug: string) {
  const assessment: Ref<Assessment | null> = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadAssessment = async () => {
    loading.value = true
    error.value = null
    
    try {
      assessment.value = getAssessment(slug)
      if (!assessment.value) {
        error.value = 'Assessment not found'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load assessment'
    } finally {
      loading.value = false
    }
  }

  // Initialize
  loadAssessment()

  return {
    assessment: readonly(assessment),
    loading: readonly(loading),
    error: readonly(error),
    loadAssessment
  }
}

export function useAssessmentMeta() {
  return {
    types: getAssessmentTypes(),
    statuses: getAssessmentStatuses(),
    authors: getAuthors()
  }
} 