import {RunnerOutput, RunnerStatus} from "../models";

class Runner {
  protected extension: string;
  protected sourceFile: string;
  protected testFile: string;

  constructor() {
    this.extension = "";
    this.sourceFile = "";
    this.testFile = "";
  }

  public getSourceFile() {
    return this.sourceFile;
  }
  public getTestFile() {
    return this.testFile;
  }

  public async run(file: string, directory: string, filename: string, extension: string): Promise<RunnerOutput> {
    console.log("run");
    return { status: RunnerStatus.NO_OP, rawOutput: "" };
  }
}

export default Runner;
