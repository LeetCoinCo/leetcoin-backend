class Runner {
  private file: string;
  private directory: string;
  private filename: string;
  private extension: string;
  private callback: () => void;

  constructor() {
    this.file = "";
    this.directory = "";
    this.filename = "";
    this.extension = "";
    this.callback = () => {};
  }

  set(file: string, directory: string, filename: string, extension: string, callback: () => void) {
    this.file = file;
    this.directory = directory;
    this.filename = filename;
    this.extension = extension;
    this.callback = callback;
  }

  run(file: string, directory: string, filename: string, extension: string, callback: () => void) {
    console.log("run");
  }
}

export default Runner;
