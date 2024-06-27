const Video = require('../models/Video');
const errorHandler = require('../utils/errors');

exports.listarVideos = async function (req, h) {
  try {
    const s3 = await req.server.methods.s3();
    const buckets = await req.server.methods.buckets(s3);

    return buckets;
  } catch (error) {
    throw errorHandler(error);
  }
};
