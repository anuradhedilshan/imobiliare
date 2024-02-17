import fs from 'fs';
import Logger from './Logger';

const temp = require('temp');

// Automatically track and cleanup files at exit

class JSONWriter {
  private writeStream: fs.WriteStream;

  private isOpen = false;

  private prev = false;

  private FIlename: string;

  private logger: Logger | null;

  constructor(filePath: string, filename: string, logger: Logger | null) {
    temp.track();
    this.FIlename = `${filePath}/${filename.replace(/[ .]/g, '_')}.json`;
    // this.writeStream = fs.createWriteStream(this.FIlename, { flags: 'w' });
    this.writeStream = temp.createWriteStream();
    this.writeStream.write('[\n');
    this.isOpen = true;
    this.logger = logger;
    this.logger?.warn(`temp file created in ${this.writeStream.path}`);
  }

  appendData(data: unknown) {
    if (!this.isOpen) {
      throw new Error('JSONWriter is closed. Cannot append data.');
    }

    const dataArray = Array.isArray(data) ? data : [data];
    dataArray.forEach((item, index) => {
      if (index > 0 || this.prev) {
        this.writeStream.write(',\n');
      }
      this.writeStream.write(JSON.stringify(item, null, 2)); // Ensure items are stringified with proper indentation (null, 2)
    });
    this.prev = true;
  }

  close() {
    if (this.isOpen) {
      this.writeStream.write('\n]');
      this.writeStream.end();
      const tempFile = this.writeStream.path;
      fs.rename(tempFile, this.FIlename, () => {
        // console.log('file Moved', e);
        this.logger?.warn(
          `temp file in <br/> ${this.writeStream.path} moved to <br/> ${this.FIlename}`,
        );
      });
      this.isOpen = false;
    }
  }
}

export default JSONWriter;
