import type { Assessment, AssessmentFilters, AssessmentListOptions } from '@/types/assessment'
import { assessments } from '@/data/assessments'
import { siteConfig } from '@/data/siteConfig'

/**
 * Format a date string into a human-readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Get all assessments sorted by publication date (newest first)
 */
export function getAssessments(options?: AssessmentListOptions): Assessment[] {
  let filtered = [...assessments]

  // Apply filters
  if (options?.filters) {
    filtered = applyFilters(filtered, options.filters)
  }

  // Sort by publication date (newest first)
  filtered.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  // Apply pagination
  if (options?.page && options?.limit) {
    const start = (options.page - 1) * options.limit
    const end = start + options.limit
    filtered = filtered.slice(start, end)
  } else if (options?.limit) {
    filtered = filtered.slice(0, options.limit)
  }

  return filtered
}

/**
 * Get a single assessment by slug
 */
export function getAssessment(slug: string): Assessment | null {
  const assessment = assessments.find(a => a.slug === slug)
  if (!assessment) return null

  // Generate default image if none provided
  const defaultImage = `${siteConfig.url}/og?title=${encodeURIComponent(assessment.title)}`
  
  return {
    ...assessment,
    image: assessment.image || defaultImage,
  }
}

/**
 * Apply filters to assessment list
 */
function applyFilters(assessments: Assessment[], filters: AssessmentFilters): Assessment[] {
  let filtered = assessments

  if (filters.type) {
    filtered = filtered.filter(a => a.type === filters.type)
  }

  if (filters.status) {
    filtered = filtered.filter(a => a.status === filters.status)
  }

  if (filters.author) {
    filtered = filtered.filter(a => 
      a.author.toLowerCase().includes(filters.author!.toLowerCase())
    )
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter(a => 
      a.title.toLowerCase().includes(query) ||
      a.summary.toLowerCase().includes(query) ||
      a.content.toLowerCase().includes(query)
    )
  }

  return filtered
}

/**
 * Get unique assessment types
 */
export function getAssessmentTypes(): string[] {
  const types = new Set(assessments.map(a => a.type).filter(Boolean))
  return Array.from(types).sort()
}

/**
 * Get unique assessment statuses
 */
export function getAssessmentStatuses(): string[] {
  const statuses = new Set(assessments.map(a => a.status).filter(Boolean))
  return Array.from(statuses).sort()
}

/**
 * Get unique authors
 */
export function getAuthors(): string[] {
  const authors = new Set(assessments.map(a => a.author).filter(Boolean))
  return Array.from(authors).sort()
}

/**
 * Get assessment statistics
 */
export function getAssessmentStats() {
  const total = assessments.length
  const done = assessments.filter(a => a.status === 'Done').length
  const inProcess = assessments.filter(a => a.status === 'In Process').length
  const pending = assessments.filter(a => a.status === 'Pending').length

  return {
    total,
    done,
    inProcess,
    pending,
    completionRate: Math.round((done / total) * 100)
  }
} 