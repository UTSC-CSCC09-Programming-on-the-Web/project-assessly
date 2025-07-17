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
