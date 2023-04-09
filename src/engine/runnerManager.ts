import * as path from "path";
import * as appRoot from "app-root-path";
import * as FileApi from "../util/fileApi";
import moment from "moment";
import {SubstrateRustRunner} from "./substrateRustRunner";
import {Language, RunnerOutput} from "../models";
import Runner from "./runner";


class Factory {
  public createRunner(lang: Language): Runner {
    let runner;
    if (lang.toString() === 'substrate_rust') {
      runner = new SubstrateRustRunner();
    } else {
      console.log(`[engine][createRunner], invalid language parameter: ${lang}`);
      throw new Error(`Invalid language parameter: ${lang}`);
    }
    return runner;
  }
}

export async function run(
  submissionId: string,
  questionId: string,
  lang: Language,
  solution: string
): Promise<RunnerOutput> {
  const factory = new Factory();
  const runner = factory.createRunner(lang);

  // copy all files in the question folder from solution folder
  const sourceDir = path.resolve(appRoot.path, "server", "solution", questionId, lang);
  const now = moment().toISOString();

  const name = `${submissionId}`;

  const targetDir = path.resolve(
    appRoot.path,
    "server",
    "engine",
    "temp",
    name, // TODO change this to submission id
  );

  try {
    // copy source code files
    await FileApi.copyDirectory(sourceDir, targetDir);

    const testcaseFile = path.join(targetDir, "testcase.txt");

    // copy test case file
    await FileApi.copyFile(path.join(sourceDir, "testcase.txt"), testcaseFile);
    console.log(`[engine][run], sourceFile: ${runner.getSourceFile()}}`);
    // save the solution to Solution.rs
    const sourceFile = path.resolve(targetDir, runner.getSourceFile());
    const filename = path.parse(sourceFile).name; // lib
    const extension = path.parse(sourceFile).ext; // .rs

    await FileApi.saveFile(sourceFile, solution);

    const testFile = path.resolve(targetDir, runner.getTestFile());
    const testFileName = path.parse(testFile).name; // main

    return await runner.run(
      testFile,
      targetDir,
      testFileName,
      extension
    );
  } catch (err) {
    console.log(`[engine][run], err: ${err}`)
    throw err;
  }
}


// function mapLanguageToDirectoryName(lang: Language): string {
//   if (lang === 'substrate_rust') {
//     return "rust";
//   } else {
//     return "";
//   }
// }
