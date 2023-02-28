import express from "express";
import {submissionDemo} from "../controllers/question";
const router = express.Router();



router.post("/demo", submissionDemo);


export default router
