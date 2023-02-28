import express from "express";
import {getQuestions, getQuestion, getQuestionSubmissions, submissionDemo} from "../controllers/question";
const router = express.Router();


router.use("/questions/:questionId", getQuestion);
router.use("/questions", getQuestions);
router.use("/question/:questionId/submissions", getQuestionSubmissions);
router.post("/demo", submissionDemo);


export default router
