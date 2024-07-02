const { listarVideos } = require('../controllers');
const { apiPrefix } = require('../utils/constants');
const route = require('../utils/route');

const vidPrefix = '/'.concat(apiPrefix, '/video');

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
      parse: true,
      allow: 'multipart/form-data',
    },
  }),
];
