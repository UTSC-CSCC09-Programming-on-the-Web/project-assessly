import dotenv from 'dotenv';
import { Router } from 'express';
import { google } from 'googleapis';
import { sendError } from '../utils/api_error_handler.js';
import { UserModel } from '../models/users_model.js';
import { TokenModel } from '../models/tokens_model.js';
import { isAuthenticated } from '../middleware/auth.js';
import { extractTokenFromReq } from '../utils/token-helpers.js';

dotenv.config();

export const oauthRouter: Router = Router();

const oauth2Client = new google.auth.OAuth2(
	process.env.OAUTH_CLIENT_ID,
	process.env.OAUTH_CLIENT_SECRET,
	process.env.OAUTH_REDIRECT_URL,
);

google.options({ auth: oauth2Client });

oauthRouter.get('/url', async (req, res) => {
	const scopes: string[] = [
		'https://www.googleapis.com/auth/userinfo.profile',
		'https://www.googleapis.com/auth/userinfo.email',
	];

	try {
		const url: string = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			prompt: 'consent',
			scope: scopes,
		});
		res.json({ url });
	} catch {
		sendError(res, 400, 'Cannot generate auth url');
	}
});

oauthRouter.get('/callback', async (req, res) => {
	const code: string = req.query.code as string;
	if (!code) {
		sendError(res, 422, 'Code is not passed in query');
	}

	try {
		const { tokens } = await oauth2Client.getToken(code);
		oauth2Client.setCredentials(tokens);

		const oauth2 = google.oauth2({
			auth: oauth2Client,
			version: 'v2',
		});

	
		const userInfoResponse = await oauth2.userinfo.get();
		const userInfo = userInfoResponse.data;
		const user = { username: userInfo.name!, email: userInfo.email! };

		const [userInstance, _] = await UserModel.upsert(user);

		const token = TokenModel.build({
			refresh_token: tokens.refresh_token as string,
			access_token: tokens.access_token as string,
			expiry_date: new Date(tokens.expiry_date!),
			UserId: userInstance.get('id') as number,
		});
		await token.save();

		res.cookie('assesslyAccessToken', tokens.access_token, { httpOnly: true, secure: false });
		res.redirect('http://localhost:5173/');
	} catch (error) {
		console.error('Error fetching user info:', error);
		sendError(res, 500, 'Failed to fetch user information');
	}
});

oauthRouter.post('/signout', isAuthenticated, async (req, res) => {
	const token = await extractTokenFromReq(req);
	await token?.destroy();
	res.cookie('assesslyAccessToken', null);
	res.json({ message: 'Signed out successfully.' });
});

oauthRouter.get('/me', isAuthenticated, async (req, res) => {
	const token = await extractTokenFromReq(req) as any;
	const user = await token?.getUser();

	if (!user) {
		return res.status(404).json({ error: "User not found." });
	}
	res.json({ username: user.username, email: user.email});
});
