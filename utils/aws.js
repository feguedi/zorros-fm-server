const {
  GetObjectCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} = require('@aws-sdk/client-s3');
const Boom = require('@hapi/boom');

const errorHandler = require('./errors');

const minMultipartSize = 5 * 1024 * 1024; // 5MB

function createClient() {
  try {
    const client = new S3Client({ region: process.env.AWS_BUCKET_REGION || 'us-east-2' });
    
    return client;
  } catch (error) {
    throw errorHandler(error);
  }
}

async function listAllBuckets(s3) {
  try {
    if (!s3) {
      throw Boom.badRequest('No existe instancia de AWS S3');
    }

    const command = new ListBucketsCommand({});

    const { Buckets } = await s3.send(command);

    return Buckets;
  } catch (error) {
    throw errorHandler(error);
  }
}

async function getObject(s3, name) {
  try {
    if (!s3) {
      throw Boom.badRequest('No existe instancia de AWS S3');
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: name,
    });

    const response = await s3.send(command);
    const str = await response.Body.transformToString();

    return str;
  } catch (error) {
    throw errorHandler(error);
  }
}

async function uploadFile(s3, { archivo, nombre }) {
  let uploadId;
  const chunks = [];
  let totalLength = 0;

  archivo.on('data', chunk => {
    chunks.push(chunk);
    totalLength += chunk.length;
  });

  try {
    if (!s3) {
      throw Boom.badRequest('No existe instancia de AWS S3');
    }

    return new Promise((resolve, reject) => {
      archivo.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);

          if (totalLength < minMultipartSize) {
            // Subir el archivo completo si es menor de 5MB
            const uploadResult = await s3.send(
              new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: nombre,
                Body: buffer
              })
            );
            resolve(uploadResult);

            return;
          }

          // Realizar carga multiparte para archivos de 5MB o más
          const multipartUpload = await s3.send(
            new CreateMultipartUploadCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: nombre,
            }),
          );

          uploadId = multipartUpload.UploadId;

          const uploadPromises = [];
          const partSize = Math.ceil(totalLength / 5);
          let partNumber = 1;

          // Dividir el buffer y subir cada parte
          for (let start = 0; start < totalLength; start += partSize) {
            const end = Math.min(start + partSize, totalLength);
            const chunk = buffer.slice(start, end);

            uploadPromises.push(
              s3.send(
                new UploadPartCommand({
                  Bucket: process.env.AWS_BUCKET_NAME,
                  Key: nombre,
                  UploadId: uploadId,
                  Body: chunk,
                  PartNumber: partNumber++
                })
              ).then((d) => {
                console.log('Part', partNumber - 1, 'uploaded');

                return d;
              })
            );
          }

          const uploadResults = await Promise.all(uploadPromises);

          const completeResult = await s3.send(
            new CompleteMultipartUploadCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: nombre,
              UploadId: uploadId,
              MultipartUpload: {
                Parts: uploadResults.map(({ ETag }, i) => ({
                  ETag,
                  PartNumber: i + 1,
                })),
              },
            }),
          );

          resolve(completeResult);
        } catch (error) {
          if (uploadId) {
            const abortCommand = new AbortMultipartUploadCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: nombre,
              UploadId: uploadId,
            });

            await s3.send(abortCommand);
          }

          reject(errorHandler(error));
        }
      });

      archivo.on('error', error => {
        reject(errorHandler(error));
      });
    });
  } catch (error) {
    throw errorHandler(error);
  }
}

module.exports = {
  createClient,
  getObject,
  listAllBuckets,
  uploadFile,
};
