const { verPerfil, modificarDatosPerfil } = require('../controllers');
const { apiPrefix } = require('../utils/constants');
const route = require('../utils/route');

const perfilPrefix = '/'.concat(apiPrefix, '/perfil');

module.exports = [
  route({
    path: perfilPrefix,
    method: 'GET',
    func(req, h) {
      return verPerfil(req, h);
    },
  }),
  route({
    path: perfilPrefix,
    method: 'PUT',
    func(req, h) {
      return modificarDatosPerfil(req, h);
    },
  }),
];
