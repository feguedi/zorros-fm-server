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

exports.hapiNowAuth = {
  verifyJWT: true,
  keychain: [process.env.SECRET_KEY],
  validate: async (request, token, h) => {
    /**
     * we asked the plugin to verify the JWT
     * we will get back the decodedJWT as token.decodedJWT
     * and we will get the JWT as token.token
     */

    const { id: usuarioId, sesion_id } = token.decodedJWT;

    /**
     * return the decodedJWT to take advantage of hapi's
     * route authentication options
     * https://hapijs.com/api#authentication-options
     */

    /**
     * Validate your token here
     */

    const usuario = await Usuario.findById(usuarioId);
    // const sesion = await Sesion.findById(sesion_id, 'usuario activo dispositivo')
    // TODO: agregar un validador de dispositivo

    // if (!sesion.activo || usuario._id !== sesion.usuario) {
    //     return { isValid: false, credentials: null }
    // }

    if (!usuario || !usuario.activo) {
      return { isValid: false, credentials: null };
    }

    return { isValid: true, credentials: token.decodedJWT };
  },
};

exports.nowAdminAuth = {
  verifyJWT: true,
  keychain: [process.env.SECRET_KEY],
  validate: async (request, token, h) => {
    return usuarioValido(token.decodedJWT);
  },
};

exports.nuevoUsuario = async (request, usr, contrasenia) => {
  try {
    const emailRegex =
      /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/g;
    const credencial = emailRegex.test(usr) ? { correoElectronico: usr } : { nickname: usr };
    const usuario = await Usuario.findOne(credencial);
    const isValid = await bcrypt.compare(contrasenia, usuario.contrasenia);

    if (usuario.nuevo) {
      return { isValid: false, credentials: null, message: 'Cambiar contraseña primero' };
    }
    if (!isValid) {
      return { isValid: false, credentials: null, message: 'Usuario no válido' };
    }

    const credentials = _.pick(usuario, ['nombres', 'apellidos', 'telefono', 'correoElectronico', 'rol', 'sucursal']);
    credentials.id = usuario._id;

    return { isValid, credentials };
  } catch (error) {
    return { isValid: false, credentials: null, message: error.message };
  }
};

exports.cookieSession = {
  cookie: {
    name: 'DUSANTSESSION',
    password: process.env.COOKIES_KEY,
    path: '/dusant',
    // ttl: Date.now() + (1000 * 60 * 60 * 24 * 7),
    isSecure: process.env.NODE_ENV === 'production',
  },
  // keepAlive: true,
  async validate(request, session) {
    return usuarioValido(session);
  },
};

exports.googleCredentials = (uri) => ({
  provider: 'google',
  password: process.env.COOKIES_KEY,
  isSecure: process.env.NODE_ENV === 'production',
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_SECRET_ID,
  location: uri,
});
