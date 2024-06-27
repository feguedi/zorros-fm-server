const { crearUsuario } = require('../controllers');
const { crearUsuarioSchema } = require('../schemas/requests');
const { apiPrefix } = require('../utils/constants');
const route = require('../utils/route');

const usuariosPrefix = '/'.concat(apiPrefix, '/usuario');

module.exports = [
  route({
    path: usuariosPrefix,
    method: 'POST',
    validations: {
      payload: crearUsuarioSchema,
    },
    func(req, h) {
      return crearUsuario(req, h);
    },
  }),
];
