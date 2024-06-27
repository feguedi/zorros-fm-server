const { Readable } = require('stream');
const { Buffer } = require('buffer');
const XLSX = require('xlsx');

exports.asyncRS = async function (stream) {
  console.log('asyncRS:', typeof stream);
  console.log('asyncRS keys:', Object.keys(stream));
  console.log('asyncRS Readable:', stream instanceof Readable);

  return new Promise((res) => {
    const buffers = [];

    stream.on('data', function (data) {
      buffers.push(data);
    });

    stream.on('end', function () {
      const buf = Buffer.concat(buffers);
      const wb = XLSX.read(buf);

      res(wb);
    });
  });
};

exports.processRS = function (stream, cb) {
  const buffers = [];

  stream.on('data', function (data) {
    buffers.push(data);
  });

  stream.on('end', function () {
    const buffer = Buffer.concat(buffers);
    const workbook = XLSX.read(buffer);

    cb(workbook);
  });
};

exports.stream2buffer = function (stream) {
  return new Promise((resolve, reject) => {
    const _buf = [];

    stream.on('data', (chunk) => _buf.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(_buf)));
    stream.on('error', (err) => reject(err));
  });
};
