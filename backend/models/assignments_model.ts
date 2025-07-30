import { sequelize } from '../datasource.js';
import { DataTypes } from 'sequelize';
import { AssessmentModel } from './assessments_model.js';

export const AssignmentModel = sequelize.define('Assignment', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    grade: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    submitted_via: {
        type: DataTypes.ENUM('manual', 'timeout'),
        allowNull: true,
    },
}, {
  indexes: [
    {
      unique: true,
      fields: ['email', 'AssessmentId'],
    },
  ],
});

AssignmentModel.belongsTo(AssessmentModel);
AssessmentModel.hasMany(AssignmentModel);