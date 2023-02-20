import {RunnerStatus} from "../models";

class Runner {
  private file: string;
  private directory: string;
  private filename: string;
  private extension: string;
  private callback: () => void;
  protected sourceFile: string;
  protected testFile: string;

  constructor() {
    this.file = "";
    this.directory = "";
    this.filename = "";
    this.extension = "";
    this.sourceFile = "";
    this.testFile = "";
    this.callback = () => {};
  }

  public getSourceFile() {
    return this.sourceFile;
  }
  public getTestFile() {
    return this.testFile;
  }

  public async run(file: string, directory: string, filename: string, extension: string): Promise<RunnerStatus> {
    console.log("run");
    return RunnerStatus.NO_OP;
  }
}

export default Runner;
