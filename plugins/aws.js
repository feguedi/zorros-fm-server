const { createClient, listAllBuckets, uploadFile, listAllFiles } = require('../utils/aws');

const awsPlugin = {
  plugin: {
    name: 'zorros-aws-s3',
    version: '1.0.0',
    register(server) {
      server.method('s3', createClient, {});

      server.method('buckets', listAllBuckets, {});

      server.method('uploadFile', uploadFile, {});

      server.method('listFiles', listAllFiles, {})

      // server.method({
      //   name: 's3',
      //   method: createClient,
      //   options: {
      //     cache: {
      //       expiresIn: 2700000,
      //       generateTimeout: 100,
      //     },
      //   },
      // });

      // server.method({
      //   name: 'buckets',
      //   method: listAllBuckets,
      //   options: {
      //     cache: {
      //       expiresIn: 2700000,
      //       generateTimeout: 100,
      //     },
      //   },
      // });
    },
  },
};

module.exports = awsPlugin;
