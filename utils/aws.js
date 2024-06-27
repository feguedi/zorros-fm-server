const { ListBucketsCommand, S3Client } = require('@aws-sdk/client-s3');
const Boom = require('@hapi/boom');

const errorHandler = require('./errors');

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
    console.log('Buckets:');
    console.log(Buckets.map((bucket) => bucket.Name).join('\n'));

    return Buckets;
  } catch (error) {
    throw errorHandler(error);
  }
}

module.exports = {
  createClient,
  listAllBuckets,
};
