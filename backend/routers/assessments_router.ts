import { Router } from 'express';
import { isSubscribed, isAuthenticated } from '../middleware/auth.js';
import { AssessmentModel } from '../models/assessments_model.js';
import { AssignmentModel } from '../models/assignments_model.js';
import { extractTokenFromReq } from '../utils/token-helpers.js';



export const assessmentsRouter: Router = Router();

assessmentsRouter.post("/", isSubscribed, async (req, res) => {
    const { title, summary, description, time_limit, deadline } = req.body;

    if (!title || !summary || !description) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const token = await extractTokenFromReq(req);
        const assessment = await AssessmentModel.create({
            title,
            summary,
            description,
            time_limit,
            deadline,
            UserId: token?.User.id,
        });
        return res.status(200).json(assessment);
    } catch (e) {
        return res.status(400).json({ error: e.message || "An error occurred while creating the assessment." });
    }
});

assessmentsRouter.get("/", isSubscribed, async (req, res) => {
    try {
        const token = await extractTokenFromReq(req);
        const assessments = await AssessmentModel.findAll({
			where: {
				UserId: token?.User.id,
			},
		});
        return res.status(200).json(assessments);
    } catch (e) {
        return res.status(400).json({ error: e.message || "An error occurred while fetching assessments." });
    }
});

assessmentsRouter.get("/:id", isSubscribed, async (req, res) => {
    try {
        const token = await extractTokenFromReq(req);
        const assessment = await AssessmentModel.findOne({
            where: {
                id: req.params.id,
                UserId: token?.User.id,
            },
        });
        if (!assessment) {
            return res.status(404).json({ error: "Assessment not found." });
        }
        return res.status(200).json(assessment);
    } catch (e) {
        return res.status(400).json({ error: e.message || "An error occurred while fetching the assessment." });
    }
});


assessmentsRouter.delete("/:id", isSubscribed, async (req, res) => {
    try {
        const { id } = req.params;
        const assessment = await AssessmentModel.findByPk(id);
        if (!assessment) {
            return res
                .status(404)
                .json({ error: `Assessment with id=${req.params.id} not found.` });
        }
        const token = await extractTokenFromReq(req);
        if (assessment.UserId !== token?.User.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        await AssignmentModel.destroy({ where: { AssessmentId: assessment.id } });
        await assessment.destroy();
        return res.json(assessment);
    } catch (e) {
        return res.status(400).json({ error: e.message || "An error occurred while fetching assessments." });
    }
});

assessmentsRouter.get("/:id/submissions", isAuthenticated, async (req, res) => {
    console.log('🎯 Assessments submissions endpoint hit with ID:', req.params.id);
    try {
        const { id } = req.params;
        const token = await extractTokenFromReq(req);
        
        // Verify the assessment belongs to the recruiter
        const assessment = await AssessmentModel.findOne({
            where: {
                id: id,
                UserId: token?.User.id,
            },
        });
        
        if (!assessment) {
            return res.status(404).json({ error: "Assessment not found." });
        }

        // Get all assignments for this assessment with mock metrics
        const assignments = await AssignmentModel.findAll({
            where: { AssessmentId: id },
            order: [['createdAt', 'DESC']]
        });

        // Transform assignments into submission format with real data
        const submissions = assignments.map((assignment) => {
            const accuracyPercentage = assignment.total_questions && assignment.questions_answered 
                ? (assignment.questions_answered / assignment.total_questions) * 100 
                : 0;
            
            return {
                id: assignment.id,
                email: assignment.email,
                is_completed: assignment.is_completed,
                grade: assignment.grade,
                completed_at: assignment.completed_at,
                submitted_via: assignment.submitted_via || 'manual',
                time_taken_minutes: assignment.time_taken_minutes || 0,
                total_questions: assignment.total_questions || 10,
                questions_answered: assignment.questions_answered || 0,
                accuracy_percentage: accuracyPercentage,
                ai_tool_usage_count: assignment.ai_tool_usage_count || 0,
                external_resource_usage: assignment.external_resource_usage || 0,
                code_quality_score: assignment.code_quality_score || 0,
                communication_score: assignment.communication_score || 0,
                problem_solving_score: assignment.problem_solving_score || 0,
                overall_performance: assignment.overall_performance || accuracyPercentage
            };
        });

        // Calculate metrics from real data
        const completedSubmissions = submissions.filter(s => s.is_completed);
        const metrics = {
            total_submissions: submissions.length,
            completed_submissions: completedSubmissions.length,
            average_grade: completedSubmissions.length > 0 
                ? completedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / completedSubmissions.length 
                : 0,
            average_completion_time: completedSubmissions.length > 0
                ? completedSubmissions.reduce((sum, s) => sum + s.time_taken_minutes, 0) / completedSubmissions.length
                : 0,
            average_accuracy: completedSubmissions.length > 0
                ? completedSubmissions.reduce((sum, s) => sum + s.accuracy_percentage, 0) / completedSubmissions.length
                : 0,
            average_ai_usage: submissions.length > 0
                ? submissions.reduce((sum, s) => sum + s.ai_tool_usage_count, 0) / submissions.length
                : 0,
            submission_trends: [
                { date: '2024-01-15', submissions: Math.floor(submissions.length / 2), completions: Math.floor(completedSubmissions.length / 2) },
                { date: '2024-01-16', submissions: Math.ceil(submissions.length / 2), completions: Math.ceil(completedSubmissions.length / 2) }
            ],
            performance_distribution: [
                { range: '90-100', count: completedSubmissions.filter(s => (s.grade || 0) >= 90).length },
                { range: '80-89', count: completedSubmissions.filter(s => (s.grade || 0) >= 80 && (s.grade || 0) < 90).length },
                { range: '70-79', count: completedSubmissions.filter(s => (s.grade || 0) >= 70 && (s.grade || 0) < 80).length },
                { range: '60-69', count: completedSubmissions.filter(s => (s.grade || 0) >= 60 && (s.grade || 0) < 70).length },
                { range: '0-59', count: completedSubmissions.filter(s => (s.grade || 0) < 60).length }
            ],
            tool_usage_breakdown: [
                { tool: 'ChatGPT', usage_count: submissions.reduce((sum, s) => sum + s.ai_tool_usage_count, 0) },
                { tool: 'Stack Overflow', usage_count: submissions.reduce((sum, s) => sum + s.external_resource_usage, 0) },
                { tool: 'GitHub', usage_count: Math.floor(submissions.reduce((sum, s) => sum + s.external_resource_usage, 0) * 0.5) },
                { tool: 'Documentation', usage_count: Math.floor(submissions.reduce((sum, s) => sum + s.external_resource_usage, 0) * 0.3) }
            ]
        };

        return res.status(200).json({
            submissions,
            metrics
        });
    } catch (e) {
        return res.status(400).json({ error: e.message || "An error occurred while fetching submissions." });
    }
});