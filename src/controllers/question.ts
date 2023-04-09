import {Request, Response} from 'express';
import {QuestionRepo} from "../storage/questionRepo";
import {QuestionSubmissionRepo} from "../storage/questionSubmissionRepo";
import {
    Language,
    QuestionSubmission,
    QuestionSubmissionResult,
    QuestionSubmissionStatus,
    RunnerStatus
} from "../models";
import {run} from "../engine/runnerManager";

export async function getQuestion(req: Request, res: Response) {
    const questionId = req.params.questionId;
    const questionRepo = QuestionRepo.getInstance();
    let question = null;
    try {
        question = await questionRepo.getQuestion(questionId);
    } catch (err) {
        res.status(500).send(err);
        return;
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
        res.status(500).send(err);
        return;
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
        res.status(500).send(err);
        return;
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
        res.status(500).send(err);
        return;
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
        res.status(500).send(err);
        return;
    }

    if (submissions) {
        res.status(200).send(submissions);
    } else {
        res.status(404).send();
    }
    return;
}

export async function submit(req: Request, res: Response) {
    // step 1 create new submission record
    const questionSubmissionRepo = QuestionSubmissionRepo.getInstance();
    let submission = null;
    try {
        submission = await questionSubmissionRepo.createQuestionSubmission(mapQuestionSubmission(req.body));
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
        return;
    }

    if (isValidCode(submission.submissionCode, submission.language)) {
        submission.status = 'failed_to_compile';
        try {
            await questionSubmissionRepo.updateQuestionSubmission(submission);
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
            return;
        }
        res.status(200).json({ rawOutput: 'Invalid code', status: RunnerStatus.FAILED_TO_COMPILE });
        return;
    }

    // step 2 call engine to run the code
    let buff = new Buffer(submission.submissionCode, 'base64');
    const solution = buff.toString('ascii');

    try {
        const { rawOutput, status } = await run(submission.id, submission.questionId, submission.language, solution);
        res.status(200).json({ rawOutput, status });
        return;
    } catch (err) {
        console.log(err);
        const lang = submission.language.toString();
        submission.status = "system_error";
        if (!submission.results) {
            submission.results = {
                cases: {

                }
            } as QuestionSubmissionResult;
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
            await questionSubmissionRepo.updateQuestionSubmission(submission);
        } catch (eErr) {
            console.log(eErr);
            res.status(500).json(eErr);
            return;
        }

        res.status(500).json(err);
        return;
    }
}

function mapQuestionSubmission(body: any): QuestionSubmission {
    const { questionId, userId, submissionCode, language, results, status } = body;
    let submission = {
        id: "" as string, // leave empty
        questionId: questionId as string,
        userId: userId as string,
        submissionCode: submissionCode as string,
        language: language as Language,
        status: "initial",
    } as QuestionSubmission;
    if (results) {
        submission.results = results as QuestionSubmissionResult;
    }
    if (status) {
        submission.status = status as QuestionSubmissionStatus;
    }

    return submission;
}


function isValidCode(code: string, lang: Language) {
    if (lang === 'substrate_rust') {
        return isValidInkContract(code);
    }
    return false;
}

function isValidInkContract(code: string): boolean {
    const inkRegex = /^[\w\s]*use ink_prelude::.*;\n\n#[ink::contract\(.*\)]\n.*impl.*{\n.*}$/gm;
    return inkRegex.test(code);
}

