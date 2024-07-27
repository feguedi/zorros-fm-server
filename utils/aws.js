const {
  GetObjectCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
  ListObjectsCommand,
  UploadPartCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} = require('@aws-sdk/client-s3');
const Boom = require('@hapi/boom');

const errorHandler = require('./errors');
const { streamToBuffer } = require('./buff');

const minMultipartSize = 5 * 1024 * 1024; // 5MB

function createClient() {
  try {
    const client = new S3Client({ region: process.env.AWS_BUCKET_REGION || 'us-east-2' });
    
    return client;
  } catch (error) {
    throw errorHandler(error);
  }
}

/**
 * Lista de buckets
 * @param {S3Client} s3 Cliente de AWS
 * @returns {[]}
 */
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

/**
 * 
 * @param {S3Client} s3 Cliente de AWS
 * @param {String} name Nombre de archivo
 * @returns {ReadableStream | null}
 */
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

    return response.Body;
  } catch (error) {
    throw errorHandler(error);
  }
}

async function listAllFiles(s3) {
  try {
    if (!s3) {
      throw Boom.badImplementation('No existe instancia de AWS S3');
    }

    const command = new ListObjectsCommand({ Bucket: process.env.AWS_BUCKET_NAME });
    const { Contents } = await s3.send(command);

    return {
      total: Contents.length,
      files: Contents.map(({ Key, LastModified, Size, ETag }) => ({
        nombre: Key,
        lastModified: LastModified,
        tamano: Size,
        ETag: String(ETag).split('').filter((c) => /[\da-zA-Z-]/g.test(c)).join(''),
      })),
    };
  } catch (error) {
    throw errorHandler(error);
  }
}

/**
 * 
 * @param {S3Client} s3 Cliente de AWS
 * @param {{ archivo: Buffer; nombre: string }} Datos Nombre y archivo a subir
 * @returns {{ message: string }} Mensaje de envío correcto de archivos
 */
async function uploadFile(s3, { archivo, nombre }) {
  try {
    if (!s3) {
      throw Boom.badImplementation('No existe instancia de AWS S3');
    }

    const buff = await streamToBuffer(archivo);
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: nombre,
      Body: buff,
    });

    const response = await s3.send(command);

    return {
      message: `Archivo ${nombre} subido`,
      ...response,
    };
  } catch (error) {
    throw errorHandler(error);
  }
}

module.exports = {
  createClient,
  getObject,
  listAllFiles,
  listAllBuckets,
  uploadFile,
};
