export interface UserSubmission {
  id: string;
  email: string;
  is_completed: boolean;
  grade?: number;
  completed_at?: string;
  submitted_via: 'manual' | 'timeout';
  time_taken_minutes: number;
  total_questions: number;
  questions_answered: number;
  accuracy_percentage: number;
  ai_tool_usage_count: number;
  external_resource_usage: number;
  code_quality_score: number;
  communication_score: number;
  problem_solving_score: number;
  overall_performance: number;
}

export interface SubmissionMetrics {
  total_submissions: number;
  completed_submissions: number;
  average_grade: number;
  average_completion_time: number;
  average_accuracy: number;
  average_ai_usage: number;
  submission_trends: {
    date: string;
    submissions: number;
    completions: number;
  }[];
  performance_distribution: {
    range: string;
    count: number;
  }[];
  tool_usage_breakdown: {
    tool: string;
    usage_count: number;
  }[];
} 