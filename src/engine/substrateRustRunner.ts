import spawnAsync from '@expo/spawn-async';
import Runner from './runner';
import {RunnerOutput, RunnerStatus} from "../models";

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

  public async run(file: string, directory: string, filename: string, extension: string): Promise<RunnerOutput> {
    if (extension.toLowerCase() !== '.rs') {
      console.log(`${file} is not a rust file.`);
      return {status: RunnerStatus.NO_OP, rawOutput: ''};
    }
    try {
      return await this.compile(file, directory, filename);
    } catch (err) {
      console.log(`[substrateRustRunner][run] err: ${err}`);
      throw err;
    }
  }

  // compile a Rust file
  async compile(file: string, directory: string, filename: string): Promise<RunnerOutput> {
    const options = {cwd: directory};
    try {
      const {stdout, stderr} = await spawnAsync('cargo', ['contract', 'build', '--offline', '--output-json', '--quiet'], options);
      if (stderr !== '') {
        return {status: RunnerStatus.FAILED_TO_COMPILE, rawOutput: stderr};
      }
      console.log(`[substrateRustRunner][compile] stdout: ${stdout}`);
      return await this.execute(directory, filename, options);
    } catch (err) {
      console.log(`[substrateRustRunner][compile] err: ${err}`);
      throw err;
    }
  }

  // execute the compiled file
  async execute(directory: string, filename: string, options: any): Promise<RunnerOutput> {
    try {
      const {stdout, stderr} = await spawnAsync('cargo', ['test', '--offline', '--quiet'], options);
      console.log(`[substrateRustRunner][execute] stdout: ${stdout}`);
      if (stderr !== '') {
        console.log(`[substrateRustRunner][execute] stderr: ${stderr}`);
        return {status: RunnerStatus.FAILED_TESTS, rawOutput: stderr};
      }
      return {status: RunnerStatus.SUCCESS, rawOutput: stdout};
    } catch (err) {
      console.error(`[substrateRustRunner][execute] stderr: ${err}`);
      return {status: RunnerStatus.SYSTEM_ERROR, rawOutput: JSON.stringify(err)};
    }
  }

  log(message: string) {
    console.log(message);
  }
}
