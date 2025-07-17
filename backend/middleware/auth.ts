import { extractTokenFromReq } from '../utils/token-helpers.js';

export const isAuthenticated = async function (req, res, next) {
	const token = await extractTokenFromReq(req) as any;
	if (!token || !token.User || token.expiry_date < Date.now()) {
		return res.status(401).json({ error: 'Not Authenticated', status: 401 });
	}
	next();
};
