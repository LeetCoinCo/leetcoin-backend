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
exports.submissionDemo = exports.getQuestionSubmissions = exports.updateQuestionSubmission = exports.createQuestionSubmission = exports.getQuestions = exports.getQuestion = void 0;
const questionRepo_1 = require("../storage/questionRepo");
const questionSubmissionRepo_1 = require("../storage/questionSubmissionRepo");
const models_1 = require("../models");
const runnerManager_1 = require("../engine/runnerManager");
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
function createQuestionSubmission(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const questionSubmissionRepo = questionSubmissionRepo_1.QuestionSubmissionRepo.getInstance();
        let submission = null;
        try {
            submission = yield questionSubmissionRepo.createQuestionSubmission(mapQuestionSubmission(req.body));
        }
        catch (err) {
            res.status(500).json(err);
        }
        if (submission) {
            res.status(200).json(submission);
        }
        else {
            res.status(404).send();
        }
        return;
    });
}
exports.createQuestionSubmission = createQuestionSubmission;
function updateQuestionSubmission(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const questionSubmissionRepo = questionSubmissionRepo_1.QuestionSubmissionRepo.getInstance();
        let submission = null;
        try {
            submission = yield questionSubmissionRepo.updateQuestionSubmission(mapQuestionSubmission(req));
        }
        catch (err) {
            res.status(500).json(err);
        }
        if (submission) {
            res.status(200).json(submission);
        }
        else {
            res.status(404).send();
        }
        return;
    });
}
exports.updateQuestionSubmission = updateQuestionSubmission;
function getQuestionSubmissions(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const questionId = req.params.questionId;
        const questionRepo = questionSubmissionRepo_1.QuestionSubmissionRepo.getInstance();
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
function mapQuestionSubmission(req) {
    const { id, questionId, userId, submissionCode, language, results, status } = req.body;
    return {
        id: id,
        questionId: questionId,
        userId: userId,
        submissionCode: submissionCode,
        language: language,
        results: results,
        status: status,
    };
}
function submissionDemo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { code } = req.body;
            let buff = new Buffer(code, 'base64');
            const solution = buff.toString('ascii');
            const language = models_1.Language.SOLIDITY;
            const { rawOutput, status } = yield (0, runnerManager_1.run)('demo', language, solution);
            res.status(200).json({ rawOutput: filterRawOutput(rawOutput), status });
        }
        catch (err) {
            console.error('error: ', err);
            res.status(500).json(err);
        }
    });
}
exports.submissionDemo = submissionDemo;
function filterRawOutput(output) {
    const splitted = output.split('Contract');
    if (splitted.length !== 2) {
        return output;
    }
    return splitted[1];
}
//# sourceMappingURL=question.js.map