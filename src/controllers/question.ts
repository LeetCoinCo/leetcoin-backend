import {Request, Response} from 'express';
import {Language, QuestionSubmission, QuestionSubmissionResult, QuestionSubmissionStatus} from "../models";
import {run} from "../engine/runnerManager";

export async function submissionDemo(req: Request, res: Response) {
    try {
        const { code } = req.body;
        let buff = new Buffer(code, 'base64');
        const solution = buff.toString('ascii');
        const language = Language.SOLIDITY;
        const { rawOutput, status } = await run('demo', language, solution);
        res.status(200).json({ rawOutput: filterRawOutput(rawOutput), status });
    } catch (err) {
        console.error('error: ', err);
        res.status(500).json(err);
    }
}

function filterRawOutput(output: string): string {
    const splitted = output.split('Contract');
    if (splitted.length !== 2) {
        return output;
    }
    return splitted[1];
}
