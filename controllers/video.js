const Boom = require('@hapi/boom');
const Video = require('../models/Video');
const errorHandler = require('../utils/errors');
const { bufferToStream } = require('../utils/buff');

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

    if (req.payload && typeof req.payload === 'object' && Object.keys(req.payload).length > 0) {
      const { nombre, archivo, nota } = req.payload;
      const filenameSplitted = String(archivo.hapi.filename).split('.');
      const extension = filenameSplitted[filenameSplitted.length - 1];
      const s3 = await req.server.methods.s3();
      const fileUploaded = await req.server.methods.uploadFile(s3, { archivo, nombre: `${nombre}.${extension}` });

      const videoNuevo = new Video({
        nombre,
        uri: fileUploaded.ETag,
        nota,
        autor: id,
      });

      await videoNuevo.save();

      return { message: `Archivo ${nombre} subido` };
    }

    throw Boom.badRequest('No es enviaron datos correctamente');
  } catch (error) {
    throw errorHandler(error);
  }
};

exports.listarVideos = async function (req, h) {
  try {
    const s3 = await req.server.methods.s3();
    const files = await req.server.methods.listFiles(s3);

    return files;
  } catch (error) {
    throw errorHandler(error);
  }
};

exports.obtenerVideo = async function (req, h) {
  try {
    const s3 = await req.server.methods.s3();
    const { nombre } = req.params;
    const video = await Video.findOne({ nombre });

    if (!video) {
      throw Boom.badRequest('No existe el archivo');
    }

    const object = await req.server.methods.getFile(s3, video.nombre);

    return object;
  } catch (error) {
    throw errorHandler(error);
  }
};
