const Video = require('../models/Video');
const errorHandler = require('../utils/errors');

async function subirMiniatura(req) {
  try {
    const { thumbnail } = req.payload;
    const filenameSplitted = String(thumbnail.hapi.filename).split('.');
  } catch (error) {
    throw errorHandler(error);
  }
}

exports.subirVideo = async function (req, h) {
  try {
    const { id } = req.auth.credentials;
    const { nombre, video, nota } = req.payload;
    const filenameSplitted = String(video.hapi.filename).split('.');
    const extension = filenameSplitted[filenameSplitted.length - 1];
    const s3 = await req.server.methods.s3();
    const fileUploaded = await req.server.methods.uploadFile(s3, { archivo: video, nombre });

    const videoNuevo = new Video({
      nombre,
      uri: fileUploaded.ETag,
      nota,
      autor: id,
    });

    await videoNuevo.save();

    return { message: `Archivo ${nombre} subido` };
  } catch (error) {
    throw errorHandler(error);
  }
};

exports.listarVideos = async function (req, h) {
  try {
    const s3 = await req.server.methods.s3();
    const buckets = await req.server.methods.buckets(s3);

    return buckets;
  } catch (error) {
    throw errorHandler(error);
  }
};
