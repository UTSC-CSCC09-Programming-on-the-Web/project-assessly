import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { sequelize } from './datasource.js';
import { oauthRouter } from './routers/oauth_router.js';
import { assessmentsRouter } from './routers/assessments_router.js';
import { assignmentsRouter } from './routers/assignments_router.js';
import { candidatesRouter } from './routers/candidates_router.js';

// Validate env variables
const envVars: string[] = [
	'DB_NAME',
	'DB_USERNAME',
	'DB_PASSWORD',
	'DB_HOST',
	'OAUTH_CLIENT_ID',
	'OAUTH_CLIENT_SECRET',
	'OAUTH_REDIRECT_URL',
];

for (const envVar of envVars) {
	if (!process.env[envVar]) {
		throw new Error(`Missing required environment variables: ${envVar}`);
	}
}

export const app: express.Express = express();
const PORT: number = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('static'));

try {
	await sequelize.authenticate();
	await sequelize.sync({ alter: { drop: false } });
	console.log('Connection has been established successfully.');
} catch (error) {
	console.error('Unable to connect to the database:', error);
}

app.use('/api/oauth', oauthRouter);
app.use('/api/assessments', assessmentsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/candidates', candidatesRouter);

app.listen(PORT, (err) => {
	if (err) console.log(err);
	else console.log('HTTP server on http://localhost:%s', PORT);
});
