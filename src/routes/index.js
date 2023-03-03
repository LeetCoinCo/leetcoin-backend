"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const question_1 = require("../controllers/question");
const router = express_1.default.Router();
router.use("/questions/:questionId", question_1.getQuestion);
router.use("/questions", question_1.getQuestions);
router.use("/question/:questionId/submissions", question_1.getQuestionSubmissions);
router.post("/demo", question_1.submissionDemo);
exports.default = router;
//# sourceMappingURL=index.js.map