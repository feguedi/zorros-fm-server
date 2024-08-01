const {
  listarVideos,
  subirVideo,
  obtenerVideo,
  modificarVideo,
  eliminarVideo,
  habilitarVideo,
  obtenerMiniatura,
} = require('../controllers');
const requestSchemas = require('../schemas/requests');
const { apiPrefix } = require('../utils/constants');
const route = require('../utils/route');

const vidPrefix = '/'.concat(apiPrefix, '/video');
const thumbPrefix = '/'.concat(apiPrefix, '/thumb');

module.exports = [
  route({
    path: vidPrefix.concat('s'),
    method: 'GET',
    tags: ['video'],
    strategies: ['token', 'session'],
    scope: ['COACH', 'ADMINISTRADOR'],
    description: 'Listar todos los videos que existan',
    func(req, h) {
      return listarVideos(req, h);
    },
  }),
  route({
    path: vidPrefix,
    method: 'POST',
    tags: ['video'],
    strategies: ['token', 'session'],
    scope: ['COACH', 'ADMINISTRADOR'],
    description: 'Subir video',
    payload: {
      output: 'stream',
      maxBytes: 838860800,
      multipart: true,
      parse: true,
      allow: 'multipart/form-data',
    },
    validations: {
      payload: requestSchemas.subirVideoConMiniaturaSchema,
    },
    func(req, h) {
      return subirVideo(req, h);
    },
  }),
  route({
    path: vidPrefix.concat('/{nombre}'),
    method: 'GET',
    tags: ['video'],
    strategies: ['token', 'session'],
    scope: ['COACH', 'ADMINISTRADOR'],
    description: 'Obtener video',
    func(req, h) {
      return obtenerVideo(req, h);
    },
  }),
  route({
    path: vidPrefix.concat('/{id}'),
    method: 'PUT',
    tags: ['video'],
    strategies: ['token', 'session'],
    scope: ['COACH', 'ADMINISTRADOR'],
    description: 'Modificar datos del video',
    validations: {
      params: requestSchemas.idSchema,
    },
    func(req, h) {
      return modificarVideo(req, h);
    },
  }),
  route({
    path: vidPrefix.concat('/{id}'),
    method: 'PATCH',
    tags: ['video'],
    strategies: ['token', 'session'],
    scope: ['ADMINISTRADOR'],
    description: 'Habilitar video',
    validations: {
      params: requestSchemas.idSchema,
    },
    func(req, h) {
      return habilitarVideo(req, h);
    },
  }),
  route({
    path: vidPrefix.concat('/{id}'),
    method: 'DELETE',
    tags: ['video'],
    strategies: ['token', 'session'],
    scope: ['ADMINISTRADOR'],
    description: 'Eliminar video',
    validations: {
      params: requestSchemas.idSchema,
    },
    func(req, h) {
      return eliminarVideo(req, h);
    },
  }),
  route({
    path: thumbPrefix.concat('/{nombre}'),
    method: 'GET',
    tags: ['video', 'thumbnail'],
    strategies: ['token', 'session'],
    scope: ['COACH', 'ADMINISTRADOR'],
    description: 'Obtener miniatura de video',
    validations: {
      params: requestSchemas.nombreArchivoSchema,
    },
    func(req, h) {
      return obtenerMiniatura(req, h);
    },
  }),
];
