import {Request, Response} from 'express';
import {QuestionRepo} from "../storage/questionRepo";

export async function getQuestion(req: Request, res: Response) {
    const questionId = req.params.questionId;
    const questionRepo = QuestionRepo.getInstance();
    const question = await questionRepo.getQuestion(questionId);

    if (question) {
        res.status(200).json(question);
    } else {
        res.status(404).send();
    }
    return;
}

export async function getQuestions(req: Request, res: Response) {
    const questionRepo = QuestionRepo.getInstance();
    const question = await questionRepo.getQuestions();

    if (question) {
        res.status(200).json(question);
    } else {
        res.status(404).send();
    }
    return;
}

export async function getQuestionSubmissions(req: Request, res: Response) {
    const questionId = req.params.questionId;
    const questionRepo = QuestionRepo.getInstance();
    const submissions = await questionRepo.getQuestionSubmissions(questionId);

    if (submissions) {
        res.status(200).json(submissions);
    } else {
        res.status(404).send();
    }
    return;
}
