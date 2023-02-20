import {Request, Response} from 'express';
import {QuestionRepo} from "../storage/questionRepo";
import {QuestionSubmissionRepo} from "../storage/questionSubmissionRepo";
import {Language, QuestionSubmission, QuestionSubmissionResult, QuestionSubmissionStatus} from "../models";

export async function getQuestion(req: Request, res: Response) {
    const questionId = req.params.questionId;
    const questionRepo = QuestionRepo.getInstance();
    let question = null;
    try {
        question = await questionRepo.getQuestion(questionId);
    } catch (err) {
        res.status(500).json(err);
    }

    if (question) {
        res.status(200).json(question);
    } else {
        res.status(404).send();
    }
    return;
}

export async function getQuestions(req: Request, res: Response) {
    const questionRepo = QuestionRepo.getInstance();
    let question = null;
    try {
        question = await questionRepo.getQuestions();
    } catch (err) {
        res.status(500).json(err);
    }

    if (question) {
        res.status(200).json(question);
    } else {
        res.status(404).send();
    }
}

export async function createQuestionSubmission(req: Request, res: Response) {
    const questionSubmissionRepo = QuestionSubmissionRepo.getInstance();
    let submission = null;
    try {
        submission = await questionSubmissionRepo.createQuestionSubmission(mapQuestionSubmission(req.body));
    } catch (err) {
        res.status(500).json(err);
    }

    if (submission) {
        res.status(200).json(submission);
    } else {
        res.status(404).send();
    }
    return;
}

export async function updateQuestionSubmission(req: Request, res: Response) {
    const questionSubmissionRepo = QuestionSubmissionRepo.getInstance();
    let submission = null;
    try {
        submission = await questionSubmissionRepo.updateQuestionSubmission(mapQuestionSubmission(req));
    } catch (err) {
        res.status(500).json(err);
    }

    if (submission) {
        res.status(200).json(submission);
    } else {
        res.status(404).send();
    }
    return;
}

export async function getQuestionSubmissions(req: Request, res: Response) {
    const questionId = req.params.questionId;
    const questionRepo = QuestionSubmissionRepo.getInstance();
    let submissions = null;
    try {
        submissions = await questionRepo.getQuestionSubmissions(questionId);
    } catch (err) {
        res.status(500).json(err);
    }

    if (submissions) {
        res.status(200).json(submissions);
    } else {
        res.status(404).send();
    }
    return;
}

function mapQuestionSubmission(req: Request): QuestionSubmission {
    const { id, questionId, userId, submissionCode, language, results, status } = req.body;
    return {
        id: id as string,
        questionId: questionId as string,
        userId: userId as string,
        submissionCode: submissionCode as string,
        language: language as Language,
        results: results as QuestionSubmissionResult,
        status: status as QuestionSubmissionStatus,
    };
}
