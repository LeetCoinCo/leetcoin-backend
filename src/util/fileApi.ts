import * as fs from "fs";
import * as path from "path";
import ncp from "ncp";
import {Language} from "../models";
import {pipeline} from "stream/promises";
import * as util from "util";


const ncpPromise = util.promisify(ncp);

export async function getFile(language: Language): Promise<string> {
  console.log(`[fileApi][getFile], language: ${language}`);
  let file = "";
  if (language === 'substrate_rust') {
    file = path.join(__dirname, "../templates", "lib.rs");
  } else {
    return "";
  }
  console.log(`[fileApi][getFile], file: ${file}`);

  try {
    const data = await fs.promises.readFile(file);
    console.log(`[fileApi][getFile], data: ${data}`);
    return data.toString();
  } catch (err) {
    console.log(`[fileApi][getFile], err: ${err}`);
    throw err;
  }
}

export async function creatDirectory(
  directory: string,
): Promise<boolean> {
  console.log(`[fileApi][creatDirectory], file: ${directory}, content: ${directory}`);
  if (!fs.existsSync(directory)) {
    try {
      await fs.promises.mkdir(directory, { recursive: true });
      return true;
    } catch (err) {
      console.log(`[fileApi][creatDirectory], err: ${err}`);
      throw err;
    }
  } else {
    return false;
  }

}

export async function saveFile(
  file: string,
  content: string,
): Promise<void> {
  // create parent directories if they don't exist.
  try {
    console.log(`[fileApi][saveFile], file: ${file}, content: ${content}`);
    await fs.promises.mkdir(path.dirname(file), {recursive: true});
    await fs.promises.writeFile(file, content);
    return;
  } catch (err) {
    console.log(`[fileApi][saveFile], err: ${err}`);
    throw err;
  }
}

export async function copyFile(source: string, target: string): Promise<void> {
  try {
    console.log(`[fileApi][copyFile], source: ${source}, target: ${target}`);
    const rd = fs.createReadStream(source);
    const wr = fs.createWriteStream(target);
    await pipeline(rd, wr);
    return;
  } catch (err) {
    console.log(`[fileApi][copyFile], err: ${err}`);
    throw err;
  }
}

export async function copyDirectory(
  source: string,
  target: string,
): Promise<void> {
  try {
    console.log(`[fileApi][copyDirectory], source: ${source}, target: ${target}`);
    await fs.promises.mkdir(target, {recursive: true});
    await ncpPromise(source, target);
    return;
  } catch (err) {
    console.log(`[fileApi][copyDirectory], err: ${err}`);
    throw err;
  }
}

export async function readFile(file: string, callback: (err: NodeJS.ErrnoException | null, data: string) => void) {
  console.log(`[fileApi][readFile], file: ${file}`);
  try {
    const data = await fs.promises.readFile(file);
    return data.toString()
  } catch (err) {
    console.log(`[fileApi][readFile], err: ${err}`);
    throw err;
  }
}
