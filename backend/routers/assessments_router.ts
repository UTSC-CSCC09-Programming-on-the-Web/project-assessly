import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { AssessmentModel } from '../models/assessment_models.js';
import { UserModel } from '../models/users_model.js';
import { TokenModel } from '../models/tokens_model.js';
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
            UserId: token?.userId,
        });
        return res.status(201).json(assessment);
    } catch (e) {
        return res.status(400).json({ error: e.message || "An error occurred while creating the assessment." });
    }
});

assessmentsRouter.get("/", isAuthenticated, async (req, res) => {
    try {
        const assessments = await AssessmentModel.findAll();
        return res.status(200).json(assessments);
    } catch (e) {
        return res.status(400).json({ error: e.message || "An error occurred while fetching assessments." });
    }
});