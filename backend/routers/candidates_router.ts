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