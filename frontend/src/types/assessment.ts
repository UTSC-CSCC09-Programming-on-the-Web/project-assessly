export interface Assessment {
  id?: number
  slug: string
  title: string
  publishedAt: string
  summary: string
  author: string
  image?: string
  content: string
  type?: AssessmentType
  status?: AssessmentStatus
  target?: string
  limit?: string
  reviewer?: string
}

export interface AssessmentAuthor {
  name: string
  image: string
  twitterUsername?: string
  updatedAt?: string
}

export interface AssessmentCard {
  data: Assessment
  priority?: boolean
}

export type AssessmentType = 
  | 'Cover page'
  | 'Table of contents' 
  | 'Narrative'
  | 'Technical content'
  | 'Plain language'
  | 'Legal'
  | 'Visual'
  | 'Financial'
  | 'Research'
  | 'Planning'

export type AssessmentStatus = 
  | 'Done'
  | 'In Process'
  | 'Pending'
  | 'Review'

export interface SiteConfig {
  name: string
  url: string
  description: string
}

export interface AssessmentFilters {
  type?: AssessmentType
  status?: AssessmentStatus
  author?: string
  searchQuery?: string
}

export interface AssessmentListOptions {
  limit?: number
  page?: number
  filters?: AssessmentFilters
} 