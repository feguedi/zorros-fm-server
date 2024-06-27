const { login } = require('../controllers');
const { loginSchema } = require('../schemas/requests');
const { apiPrefix } = require('../utils/constants');
const route = require('../utils/route');

const authPrefix = '/'.concat(apiPrefix, '/auth');

module.exports = [
  route({
    path: authPrefix.concat('/login'),
    method: 'POST',
    tags: ['auth'],
    validations: {
      payload: loginSchema,
    },
    description: 'Iniciar sesión de usuario',
    func(req, h) {
      return login(req, h);
    },
  }),
];
