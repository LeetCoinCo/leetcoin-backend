import spawnAsync from '@expo/spawn-async';
import Runner from './runner';
import {RunnerStatus} from "../models";

export class SubstrateRustRunner extends Runner {
  private readonly defaultFile: string;

  public getDefaultFile() {
    return this.defaultFile;
  }

  constructor() {
    super();
    this.defaultFile = 'lib.rs';
    this.sourceFile = "lib.rs";
    this.testFile = "lib.rs";
  }

  public async run(file: string, directory: string, filename: string, extension: string): Promise<RunnerStatus> {
    if (extension.toLowerCase() !== '.rs') {
      console.log(`${file} is not a rust file.`);
      return RunnerStatus.NO_OP;
    }
    try {
      return await this.compile(file, directory, filename);
    } catch (err) {
      console.log(`[substrateRustRunner][run] err: ${err}`);
      throw err;
    }
  }

  // compile a Rust file
  async compile(file: string, directory: string, filename: string): Promise<RunnerStatus> {
    const options = {cwd: directory};
    try {
      const {stdout, stderr} = await spawnAsync('cargo', ['contract', 'build', '--offline', '--output-json', '--quiet'], options);
      if (stderr !== '') {
        return RunnerStatus.FAILED_TO_COMPILE;
      }
      console.log(`[substrateRustRunner][compile] stdout: ${stdout}`);
      return await this.execute(directory, filename, options);
    } catch (err) {
      console.log(`[substrateRustRunner][compile] err: ${err}`);
      throw err;
    }
  }

  // execute the compiled file
  async execute(directory: string, filename: string, options: any): Promise<RunnerStatus> {
    try {
      const {stdout, stderr} = await spawnAsync('cargo', ['test', '--offline', '--quiet'], options);
      console.log(`[substrateRustRunner][execute] stdout: ${stdout}`);
      if (stderr !== '') {
        console.log(`[substrateRustRunner][execute] stderr: ${stderr}`);
        return RunnerStatus.FAILED_TESTS;
      }
      return RunnerStatus.SUCCESS;
    } catch (err) {
      console.error(`[substrateRustRunner][execute] stderr: ${err}`);
      return RunnerStatus.SYSTEM_ERROR;
    }
  }

  log(message: string) {
    console.log(message);
  }
}
