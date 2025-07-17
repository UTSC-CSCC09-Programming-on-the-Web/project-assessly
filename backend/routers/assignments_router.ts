import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { extractTokenFromReq } from '../utils/token-helpers.js';
import { AssignmentModel } from '../models/assignments_model.js';

export const assignmentsRouter: Router = Router();

assignmentsRouter.post("/:id", isAuthenticated, async (req, res) => {
    const email = req.body.email;
    const { id } = req.params;
    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }

    try {
        const assignment = await AssignmentModel.create({
            email,
            AssessmentId: id,
        });
        return res.status(200).json(assignment);
    } catch (e) {
        return res.status(400).json({ error: e.message || "An error occurred while creating the assignment." });
    }
});