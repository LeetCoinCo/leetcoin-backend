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
exports.submissionDemo = void 0;
const models_1 = require("../models");
const runnerManager_1 = require("../engine/runnerManager");
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