import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize: Sequelize = new Sequelize(
	process.env.DB_NAME!,
	process.env.DB_USERNAME!,
	process.env.DB_PASSWORD!,
	{
		host: process.env.DB_HOST!,
		dialect: 'postgres',
	},
);
