import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { AssessmentModel } from '../models/assessments_model.js';
import { AssignmentModel } from '../models/assignments_model.js';
import { extractTokenFromReq } from '../utils/token-helpers.js';



export const assessmentsRouter: Router = Router();

assessmentsRouter.post("/", isAuthenticated, async (req, res) => {
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

assessmentsRouter.get("/", isAuthenticated, async (req, res) => {
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

assessmentsRouter.get("/:id", isAuthenticated, async (req, res) => {
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


assessmentsRouter.delete("/:id", isAuthenticated, async (req, res) => {
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

        // Transform assignments into submission format with mock data
        const submissions = assignments.map((assignment, index) => ({
            id: assignment.id,
            email: assignment.email,
            is_completed: assignment.is_completed,
            grade: assignment.grade,
            completed_at: assignment.completed_at,
            submitted_via: assignment.submitted_via || 'manual',
            time_taken_minutes: Math.floor(Math.random() * 60) + 20, // Mock: 20-80 minutes
            total_questions: 10,
            questions_answered: assignment.is_completed ? Math.floor(Math.random() * 3) + 8 : Math.floor(Math.random() * 5) + 1, // Mock: 8-10 if completed, 1-5 if not
            accuracy_percentage: assignment.is_completed ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40) + 40, // Mock: 70-100% if completed, 40-80% if not
            ai_tool_usage_count: Math.floor(Math.random() * 6), // Mock: 0-5
            external_resource_usage: Math.floor(Math.random() * 4), // Mock: 0-3
            code_quality_score: assignment.is_completed ? (Math.random() * 3 + 7) : (Math.random() * 4 + 4), // Mock: 7-10 if completed, 4-8 if not
            communication_score: assignment.is_completed ? (Math.random() * 3 + 7) : (Math.random() * 4 + 4),
            problem_solving_score: assignment.is_completed ? (Math.random() * 3 + 7) : (Math.random() * 4 + 4),
            overall_performance: assignment.is_completed ? (Math.random() * 30 + 70) : (Math.random() * 40 + 40)
        }));

        // Calculate metrics
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
            average_ai_usage: submissions.reduce((sum, s) => sum + s.ai_tool_usage_count, 0) / submissions.length,
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
                { tool: 'ChatGPT', usage_count: submissions.reduce((sum, s) => sum + Math.floor(s.ai_tool_usage_count * 0.6), 0) },
                { tool: 'Stack Overflow', usage_count: submissions.reduce((sum, s) => sum + Math.floor(s.external_resource_usage * 0.8), 0) },
                { tool: 'GitHub', usage_count: submissions.reduce((sum, s) => sum + Math.floor(s.external_resource_usage * 0.4), 0) },
                { tool: 'Documentation', usage_count: submissions.reduce((sum, s) => sum + Math.floor(s.external_resource_usage * 0.3), 0) }
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