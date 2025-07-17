export interface Assessment {
	id?: number;
	title: string;
	summary: string;
	deadline?: string;
	description: string;
	time_limit?: number; // in minutes
	Assignments?: Assignment[];
	User?: Recruiter; // email of the recruiter who created the assessment
}

export interface Assignment {
	id: number;
	email: string;
	is_completed: boolean;
	grade?: number; // score given to the assignment
}

export interface Recruiter {
	username: string;
}

export type AssessmentStatus = 'Done' | 'In Progress' | 'Not Completed';