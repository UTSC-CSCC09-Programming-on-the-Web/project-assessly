import { sequelize } from '../datasource.js';
import { DataTypes } from 'sequelize';
import { UserModel } from './users_model.js';

export const TokenModel = sequelize.define('Token', {
	refresh_token: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	access_token: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	expiry_date: {
		type: DataTypes.DATE,
		allowNull: false,
	},
});

TokenModel.belongsTo(UserModel);
UserModel.hasMany(TokenModel);
