import { TokenModel } from '../models/tokens_model.js';
import { UserModel } from '../models/users_model.js';

export async function extractTokenFromReq(req) {
	const token = req.cookies?.assesslyAccessToken;
	if (!token) {
		return null;
	}
	return await TokenModel.findOne({ where: { access_token: token }, include: UserModel });
	
}
