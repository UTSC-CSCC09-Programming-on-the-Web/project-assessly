import { Router } from 'express';
import { isSubscribed } from '../middleware/auth.js';
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