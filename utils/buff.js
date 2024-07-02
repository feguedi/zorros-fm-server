const { Readable } = require('stream');

// https://stackoverflow.com/questions/47089230/how-to-convert-buffer-to-stream-in-nodejs/54136803
exports.bufferToStream = function (binary) {
  const readableStream = new Readable({
    read() {
      try {
        const data = Buffer.from(binary, 'utf-8');
        this.push(data);
        this.push(null);
      } catch (error) {
        console.error('Imposible adherir: ', error);
        throw error;
      }
    },
  });

  return readableStream;
}
