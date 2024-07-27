const { verPerfil, modificarDatosPerfil } = require('../controllers');
const requestSchemas = require('../schemas/requests');
const { apiPrefix } = require('../utils/constants');
const route = require('../utils/route');

const perfilPrefix = '/'.concat(apiPrefix, '/perfil');

module.exports = [
  route({
    path: perfilPrefix,
    method: 'GET',
    strategies: ['session', 'token'],
    scope: ['ADMINISTRADOR', 'COACH', 'JUGADOR'],
    func(req, h) {
      return verPerfil(req, h);
    },
  }),
  route({
    path: perfilPrefix,
    method: 'PUT',
    strategies: ['session', 'token'],
    scope: ['ADMINISTRADOR', 'COACH', 'JUGADOR'],
    validations: {
      payload: requestSchemas.modificarDatosUsuarioSchema,
    },
    func(req, h) {
      return modificarDatosPerfil(req, h);
    },
  }),
];
