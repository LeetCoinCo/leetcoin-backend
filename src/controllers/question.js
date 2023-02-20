"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestionSubmissions = exports.getQuestions = exports.getQuestion = void 0;
const questionRepo_1 = require("../storage/questionRepo");
function getQuestion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const questionId = req.params.questionId;
        const questionRepo = questionRepo_1.QuestionRepo.getInstance();
        let question = null;
        try {
            question = yield questionRepo.getQuestion(questionId);
        }
        catch (err) {
            res.status(500).json(err);
        }
        if (question) {
            res.status(200).json(question);
        }
        else {
            res.status(404).send();
        }
        return;
    });
}
exports.getQuestion = getQuestion;
function getQuestions(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const questionRepo = questionRepo_1.QuestionRepo.getInstance();
        let question = null;
        try {
            question = yield questionRepo.getQuestions();
        }
        catch (err) {
            res.status(500).json(err);
        }
        if (question) {
            res.status(200).json(question);
        }
        else {
            res.status(404).send();
        }
    });
}
exports.getQuestions = getQuestions;
function getQuestionSubmissions(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const questionId = req.params.questionId;
        const questionRepo = questionRepo_1.QuestionRepo.getInstance();
        let submissions = null;
        try {
            submissions = yield questionRepo.getQuestionSubmissions(questionId);
        }
        catch (err) {
            res.status(500).json(err);
        }
        if (submissions) {
            res.status(200).json(submissions);
        }
        else {
            res.status(404).send();
        }
        return;
    });
}
exports.getQuestionSubmissions = getQuestionSubmissions;
//# sourceMappingURL=question.js.map