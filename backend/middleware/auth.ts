import { UserModel } from '../models/users_model.js';
import { extractTokenFromReq } from '../utils/token-helpers.js';

export const isAuthenticated = async function (req, res, next) {
	const token = await extractTokenFromReq(req) as any;
	if (!token || !token.User || token.expiry_date < Date.now()) {
		return res.status(401).json({ error: 'Not Authenticated', status: 401 });
	}
	next();
};

export const isSubscribed = async function (req, res, next) {
    // First check authentication
    const token = await extractTokenFromReq(req) as any;
    if (!token || !token.User || token.expiry_date < Date.now()) {
        return res.status(401).json({ error: 'Not Authenticated', status: 401 });
    }

    try {
        const user = await UserModel.findByPk(token.User.id) as any;
        
        if (!user) {
            return res.status(404).json({ error: 'User not found', status: 404 });
        }

        if (!user.isSubscribed) {
            return res.status(401).json({ 
                error: 'Active subscription required', 
                status: 401,
                needsSubscription: true 
            });
        }

        next();
    } catch (error) {
        console.error('Error checking subscription:', error);
        return res.status(500).json({ error: 'Failed to verify subscription' });
    }
};