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

exports.streamToBuffer = async function (readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    readableStream.on('data', data => {
      if (typeof data === 'string') {
        // Convert string to Buffer assuming UTF-8 encoding
        chunks.push(Buffer.from(data, 'utf-8'));
      } else if (data instanceof Buffer) {
        chunks.push(data);
      } else {
        // Convert other data types to JSON and then to a Buffer
        const jsonData = JSON.stringify(data);
        chunks.push(Buffer.from(jsonData, 'utf-8'));
      }
    });

    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    readableStream.on('error', reject);
  });
};
