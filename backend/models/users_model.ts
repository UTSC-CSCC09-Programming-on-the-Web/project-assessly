import { sequelize } from '../datasource.js';
import { DataTypes } from 'sequelize';

export const UserModel = sequelize.define('User', {
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	username: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});
