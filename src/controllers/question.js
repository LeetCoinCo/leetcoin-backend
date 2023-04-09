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
exports.submit = exports.getQuestionSubmissions = exports.updateQuestionSubmission = exports.createQuestionSubmission = exports.getQuestions = exports.getQuestion = void 0;
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
            res.status(500).send(err);
            return;
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
            res.status(500).send(err);
            return;
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
            res.status(500).send(err);
            return;
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
            res.status(500).send(err);
            return;
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
            res.status(500).send(err);
            return;
        }
        if (submissions) {
            res.status(200).send(submissions);
        }
        else {
            res.status(404).send();
        }
        return;
    });
}
exports.getQuestionSubmissions = getQuestionSubmissions;
function submit(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // step 1 create new submission record
        const questionSubmissionRepo = questionSubmissionRepo_1.QuestionSubmissionRepo.getInstance();
        let submission = null;
        try {
            submission = yield questionSubmissionRepo.createQuestionSubmission(mapQuestionSubmission(req.body));
        }
        catch (err) {
            console.log(err);
            res.status(500).send(err);
            return;
        }
        if (isValidCode(submission.submissionCode, submission.language)) {
            submission.status = 'failed_to_compile';
            try {
                yield questionSubmissionRepo.updateQuestionSubmission(submission);
            }
            catch (err) {
                console.log(err);
                res.status(500).json(err);
                return;
            }
            res.status(200).json({ rawOutput: 'Invalid code', status: models_1.RunnerStatus.FAILED_TO_COMPILE });
            return;
        }
        // step 2 call engine to run the code
        let buff = new Buffer(submission.submissionCode, 'base64');
        const solution = buff.toString('ascii');
        try {
            const { rawOutput, status } = yield (0, runnerManager_1.run)(submission.id, submission.questionId, submission.language, solution);
            res.status(200).json({ rawOutput, status });
            return;
        }
        catch (err) {
            console.log(err);
            const lang = submission.language.toString();
            submission.status = "system_error";
            if (!submission.results) {
                submission.results = {
                    cases: {}
                };
            }
            submission.results.cases = {
                lang: {
                    id: '',
                    rawOutput: '',
                    runtime: 0,
                    display: true,
                }
            };
            try {
                yield questionSubmissionRepo.updateQuestionSubmission(submission);
            }
            catch (eErr) {
                console.log(eErr);
                res.status(500).json(eErr);
                return;
            }
            res.status(500).json(err);
            return;
        }
    });
}
exports.submit = submit;
function mapQuestionSubmission(body) {
    const { questionId, userId, submissionCode, language, results, status } = body;
    let submission = {
        id: "",
        questionId: questionId,
        userId: userId,
        submissionCode: submissionCode,
        language: language,
        status: "initial",
    };
    if (results) {
        submission.results = results;
    }
    if (status) {
        submission.status = status;
    }
    return submission;
}
function isValidCode(code, lang) {
    if (lang === 'substrate_rust') {
        return isValidInkContract(code);
    }
    return false;
}
function isValidInkContract(code) {
    const inkRegex = /^[\w\s]*use ink_prelude::.*;\n\n#[ink::contract\(.*\)]\n.*impl.*{\n.*}$/gm;
    return inkRegex.test(code);
}
//# sourceMappingURL=question.js.map