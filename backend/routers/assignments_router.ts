import { Router } from 'express';
import { isSubscribed } from '../middleware/auth.js';
import { AssignmentModel } from '../models/assignments_model.js';

export const assignmentsRouter: Router = Router();

assignmentsRouter.post("/:id", isSubscribed, async (req, res) => {
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