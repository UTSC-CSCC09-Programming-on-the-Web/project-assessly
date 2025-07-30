import { Assessment } from "@/types/assessment";

async function handleResponse<T>(res: Response): Promise<T> {
	return res.json().then((data) => {
		if (!res.ok) {
			throw {
				message: data.error || 'Unknown error',
				status: res.status,
			};
		}
		return data as T;
	});
}

export async function getOauthUrl(): Promise<{ url: string }> {
	return fetch('/api/oauth/url').then(handleResponse<{ url: string }>);
}

export async function signOut(): Promise<{ message: string }> {
	return fetch('/api/oauth/signout', { method: 'POST' }).then(
		handleResponse<{ message: string }>,
	);
}

export async function getMe(): Promise<{ message: string }> {
	return fetch('/api/oauth/me').then(handleResponse<{ message: string }>);
}

export async function createAssessment(data: Partial<Assessment>): Promise<Assessment> {
	return fetch('/api/assessments', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	}).then(handleResponse<Assessment>);
}

export async function getRecruitersAssessment(): Promise<[Assessment]> {
	return fetch('/api/assessments', {
		method: 'GET',
	}).then(handleResponse<[Assessment]>);
}

export async function getRecruitersAssessmentDetails(id: string): Promise<Assessment> {
	return fetch(`/api/assessments/${id}`, {
		method: 'GET',
	}).then(handleResponse<Assessment>);
}

export async function deleteAssessment(id: number): Promise<Assessment> {
	return fetch(`/api/assessments/${id}`, {
		method: 'DELETE',
	}).then(handleResponse<Assessment>);
}


export async function createAssignment(id: string, email: string) {
	return fetch(`/api/assignments/${id}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email }),
	}).then(handleResponse);
}

export async function getCandidatesAssessments(): Promise<{ assessments: Assessment[], totalCount: number, completedCount: number }> {
	return fetch('/api/candidates/assessments', {
		method: 'GET',
	}).then(handleResponse<{ assessments: Assessment[], totalCount: number, completedCount: number }>);
}

export async function getCandidatesAssessmentDetails(id: string): Promise<Assessment> {
	return fetch(`/api/candidates/assessments/${id}`, {
		method: 'GET',
	}).then(handleResponse<Assessment>);
}

export async function getEphemeralToken() {
	return fetch(`/api/tokens`, {
		method: 'GET',
	}).then(handleResponse);
}

export async function startStripeCheckoutSession() {
	return fetch(`/api/stripe/create-checkout-session`, {
		method: 'POST',
	}).then(handleResponse);
}

export async function getSubscriptionStatus() {
	return fetch(`/api/stripe/subscription-status`, {
		method: 'GET',
	}).then(handleResponse);
}