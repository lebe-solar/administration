import express from "express";
import { CATEGORIES } from "../models/product";

const router = express.Router();

router.get("/", (req, res) => {
    res.json(CATEGORIES);
});

export default router;
