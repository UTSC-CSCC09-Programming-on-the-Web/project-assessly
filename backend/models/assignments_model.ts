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
    // Real metrics fields
    time_taken_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    questions_answered: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    total_questions: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 10,
    },
    ai_tool_usage_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    external_resource_usage: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    code_quality_score: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    communication_score: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    problem_solving_score: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    overall_performance: {
        type: DataTypes.FLOAT,
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