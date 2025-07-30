import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { extractTokenFromReq } from '../utils/token-helpers.js';
import { AssignmentModel } from '../models/assignments_model.js';
import { AssessmentModel } from '../models/assessments_model.js';
import { UserModel } from '../models/users_model.js';

export const candidatesRouter: Router = Router();

candidatesRouter.get("/assessments", isAuthenticated, async (req, res) => {
    try {
        const token = await extractTokenFromReq(req);
        const email = token.User.email;

        const assessments = await AssessmentModel.findAll({
            include: [{
                model: AssignmentModel,
                where: { email }
            },
            {model: UserModel,  attributes: ['username']}],
        });

        const totalCount = await AssignmentModel.count({
            where: { email }
        });

        const completedCount = await AssignmentModel.count({
            where: {
                email,
                is_completed: true
            }
        });

        return res.status(200).json({
            assessments,
            totalCount,
            completedCount
        });
    } catch (e) {
        return res.status(400).json({ error: e.message || "An error occurred while fetching assessments." });
    }
});

candidatesRouter.get("/assessments/:id", isAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        const token = await extractTokenFromReq(req);
        const email = token?.User.email;

        const assessment = await AssessmentModel.findOne({
            where: { id },
            include: [{
                model: AssignmentModel,
                where: { email }
            }],
        });
        if (!assessment || assessment.Assignments.length === 0) {
            return res.status(404).json({ error: "Assessment not found." });
        }
        return res.status(200).json(assessment);
    } catch (e) {
        return res.status(400).json({ error: e.message || "An error occurred while creating the assignment." });
    }
});

candidatesRouter.post("/assessments/:id/complete", isAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        const token = await extractTokenFromReq(req);
        const email = token?.User.email;

        // Find the assignment for this candidate and assessment
        const assignment = await AssignmentModel.findOne({
            where: { 
                AssessmentId: id,
                email: email
            }
        });

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found." });
        }

        // Calculate real metrics from request body or use defaults
        const timeTakenMinutes = req.body.time_taken_minutes || 0;
        const questionsAnswered = req.body.questions_answered || 0;
        const totalQuestions = req.body.total_questions || 10;
        const aiToolUsage = req.body.ai_tool_usage_count || 0;
        const externalResources = req.body.external_resource_usage || 0;
        
        // Calculate scores (simple calculation - can be enhanced later)
        const accuracyPercentage = totalQuestions > 0 ? (questionsAnswered / totalQuestions) * 100 : 0;
        const codeQualityScore = req.body.code_quality_score || (accuracyPercentage / 10); // Simple mapping
        const communicationScore = req.body.communication_score || 7.5; // Default score
        const problemSolvingScore = req.body.problem_solving_score || (accuracyPercentage / 10);
        const overallPerformance = req.body.overall_performance || accuracyPercentage;

        // Mark the assignment as completed with real metrics
        await assignment.update({
            is_completed: true,
            grade: req.body.grade || overallPerformance,
            completed_at: new Date(),
            submitted_via: req.body.submitted_via || 'manual',
            time_taken_minutes: timeTakenMinutes,
            questions_answered: questionsAnswered,
            total_questions: totalQuestions,
            ai_tool_usage_count: aiToolUsage,
            external_resource_usage: externalResources,
            code_quality_score: codeQualityScore,
            communication_score: communicationScore,
            problem_solving_score: problemSolvingScore,
            overall_performance: overallPerformance
        });

        return res.status(200).json({ 
            message: "Assessment completed successfully.",
            assignment 
        });
    } catch (e) {
        return res.status(400).json({ error: e.message || "An error occurred while completing the assessment." });
    }
});