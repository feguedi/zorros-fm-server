/* eslint-disable camelcase */
/* eslint-disable no-control-regex */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/Usuario');
const { usuarioValido } = require('./auth');

exports.jwtTokenStrategy = {
  keys: {
    key: process.env.SECRET_KEY,
    algorithms: ['HS512'],
  },
  verify: {
    aud: false,
    iss: false,
    sub: false,
    nbf: true,
    exp: true,
    maxAgeSec: 7 * 24 * 60 * 60000, // 1 semana
    // timeSkewSec: 15
  },
  validate: async (artifacts, request, h) => {
    return usuarioValido(artifacts.decoded.payload);
  },
};

exports.nuevoUsuario = async (request, usr, contrasenia) => {
  try {
    const credencial = { nickname: usr };
    const usuario = await Usuario.findOne(credencial);
    const isValid = await bcrypt.compare(contrasenia, usuario.contrasenia);

    if (usuario.nuevo) {
      return { isValid: false, credentials: null, message: 'Cambiar contraseña primero' };
    }
    if (!isValid) {
      return { isValid: false, credentials: null, message: 'Usuario no válido' };
    }

    const credentials = _.pick(usuario, ['nombre', 'telefono', 'imagen', 'rol', 'sucursal']);
    credentials.id = usuario._id;

    return { isValid, credentials };
  } catch (error) {
    return { isValid: false, credentials: null, message: error.message };
  }
};

exports.cookieSession = {
  cookie: {
    name: 'ZORROSSESSION',
    password: process.env.COOKIES_KEY,
    path: '/zorros',
    // ttl: Date.now() + (1000 * 60 * 60 * 24 * 7),
    isSecure: process.env.NODE_ENV === 'production',
  },
  // keepAlive: true,
  async validate(request, session) {
    return usuarioValido(session);
  },
};
