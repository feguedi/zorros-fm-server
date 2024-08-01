const Boom = require('@hapi/boom');
const mongoose = require('mongoose');
const Video = require('../models/Video');
const errorHandler = require('../utils/errors');
const { bufferToStream } = require('../utils/buff');

function isValidID(_id) {
  return mongoose.Types.ObjectId.isValid(_id);
}

function getID(obj = { id: '' }) {
  const { id } = obj;

  if (!isValidID(id)) {
    throw Boom.badRequest('Datos mal enviados');
  }

  return { id };
}

async function subirMiniatura(req, s3) {
  try {
    const { thumbnail } = req.payload;
    if (!thumbnail) {
      return;
    }

    const filename = String(thumbnail.hapi.filename);
    const s3 = await req.server.methods.s3();
    await req.server.methods.uploadFile(s3, { archivo: thumbnail, nombre: filename });

    return { message: `Miniatura ${filename} subida`, nombre: filename };
  } catch (error) {
    throw errorHandler(error);
  }
}

exports.subirVideo = async function (req, h) {
  try {
    const { id } = req.auth.credentials;

    if (typeof req.payload === 'object' && Object.keys(req.payload).length > 0) {
      const { nombre: _nombre, archivo, nota } = req.payload;
      const filenameSplitted = String(archivo.hapi.filename).split('.');
      filenameSplitted.pop();
      const nombre = _nombre || archivo.hapi.filename;
      const s3 = await req.server.methods.s3();
      const fileUploaded = await req.server.methods.uploadFile(s3, {
        archivo,
        nombre,
      });

      const videoNuevo = new Video({
        nombre,
        uri: fileUploaded.ETag,
        nota,
        autor: id,
      });

      try {
        const miniatura = await subirMiniatura(req, s3);

        videoNuevo.thumbnail = miniatura.nombre;

        await videoNuevo.save();

        return { message: `Archivo ${nombre} subido. ${miniatura.message}` };
      } catch (error) {
        console.error(`Error subirMiniatura: ${error}`);
      }

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

    if (!video || (video && !video.activo)) {
      throw Boom.notFound('No existe el archivo');
    }

    const object = await req.server.methods.getFile(s3, video.nombre);

    return object;
  } catch (error) {
    throw errorHandler(error);
  }
};

exports.modificarVideo = async function (req, h) {
  try {
    const { id } = getID(req.params);
    const { id: autor } = req.auth.credentials;
    const { nombre, thumbnail } = req.payload;
    const videoSelector = ['nombre', 'thumbnail', 'autor', 'activo'];

    const video = await Video.findById(id, videoSelector.join(' '));
    console.log('usuario:', autor);
    console.log('autor:', video.autor);

    if (String(video.autor) !== String(autor)) {
      throw Boom.forbidden('Solo el autor del video puede modificar sus datos');
    }
    if (!video || (video && !video.activo)) {
      throw Boom.notFound('No existe el video');
    }

    if (!nombre && !thumbnail) {
      throw Boom.badRequest('Datos mal enviados');
    }
    if (nombre) {
      video.nombre = nombre;
    }
    if (thumbnail) {
      video.thumbnail = thumbnail;
    }

    video.activo = true;

    await video.save();

    return { message: `Video "${video.nombre}" modificado` };
  } catch (error) {
    throw errorHandler(error);
  }
};

exports.habilitarVideo = async function (req, h) {
  try {
    const { id } = getID(req.params);
    const video = await Video.findById(id);

    if (!video) {
      throw Boom.notFound('Video no encontrado');
    }
    if (video && video.activo) {
      throw Boom.badRequest('El video ya está habilitado');
    }

    video.activo = true;

    await video.save();

    return { message: `Video "${video.nombre}" habilitado` };
  } catch (error) {
    throw errorHandler(error);
  }
};

exports.eliminarVideo = async function (req, h) {
  try {
    const { id } = getID(req.params);
    const video = await Video.findById(id);

    if (!video || (video && !video.activo)) {
      throw Boom.notFound('Video no encontrado');
    }

    video.activo = false;

    await video.save();

    return { message: `Video "${video.nombre}" eliminado` };
  } catch (error) {
    throw errorHandler(error);
  }
};

exports.obtenerMiniatura = async function (req, h) {
  try {
    const { nombre: thumbnail } = req.params;
    const video = await Video.findOne({ thumbnail });

    if (!video) {
      throw Boom.notFound('No existe el archivo');
    }

    const s3 = await req.server.methods.s3();
    const object = await req.server.methods.getFile(s3, thumbnail);

    return object;
  } catch (error) {
    throw errorHandler(error);
  }
};
