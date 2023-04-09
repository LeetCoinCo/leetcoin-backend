import express from "express";
import {getQuestions, getQuestion, getQuestionSubmissions, submit} from "../controllers/question";
const router = express.Router();


router.get("/questions/:questionId", getQuestion);
router.get("/questions", getQuestions);
router.get("/questions/:questionId/submissions", getQuestionSubmissions);
router.post("/questions/:questionId/submissions", submit);


export default router
