import chokidar from 'chokidar';
import fs from 'fs';

export class FileStorage<T> {
  private fileName: string;
  private file: T;
  private updating: boolean = false;

  constructor(fileName: string) {
    this.fileName = fileName;
    this.file = this.fileContents();

    const watcher = chokidar.watch(fileName, {
      ignoreInitial: true,
    });

    watcher.on('change', () => {
      if (this.updating) {
        this.updating = false;
      } else {
        this.file = this.fileContents();
      }
    });
  }

  public get(): T {
    return this.file;
  }

  public set(fn: (state: T) => void) {
    this.updating = true;
    fn(this.file);
    fs.writeFileSync(this.fileName, JSON.stringify(this.file, null, 2));
  }

  private fileContents(): T {
    return JSON.parse(fs.readFileSync(this.fileName).toString());
  }
}
