import { sequelize } from '../datasource.js';
import { DataTypes } from 'sequelize';
import { UserModel } from './users_model.js';

export const AssessmentModel = sequelize.define('Assessment', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    summary: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    time_limit: {
        type: DataTypes.INTEGER,
		allowNull: true,
    },
    deadline: {
		type: DataTypes.DATE,
		allowNull: true,
    }
});

AssessmentModel.belongsTo(UserModel);
UserModel.hasMany(AssessmentModel);