export interface Assessment {
	id?: number;
	title: string;
	summary: string;
	author: string;
	deadline?: string;
	publishedAt: string;
	content: string;
	time_limit?: number; // in minutes
}

export type AssessmentStatus = 'Done' | 'In Progress' | 'Not Completed';