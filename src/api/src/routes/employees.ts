import express from "express";
import { EmployeeModel } from "../models/employee";

const router = express.Router();

// Stand-in for "load employees from the company GraphQL API" — no such API exists in
// this environment. Only active employees are returned, matching the spec's dropdown rule.
router.get("/", async (req, res) => {
    const rows = await EmployeeModel.find({ active: true }).sort({ name: 1 }).exec();
    res.json(rows.map(r => r.toJSON()));
});

export default router;
