/* eslint-disable no-bitwise */
/* eslint-disable no-underscore-dangle */
const jwt = require('@hapi/jwt');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/Usuario');

exports.generateToken = (datos, algorithm = 'HS512') =>
  jwt.token.generate(
    datos,
    {
      key: process.env.SECRET_KEY,
      algorithm,
    },
    {
      typ: 'JWT',
      iat: Date.now(),
      exp: '7d',
      // nbf: '7d',
      // ttlSec: 7 * 24 * 60 * 60000
    },
  );

exports.validate = async (request, nickname, contrasenia) => {
  try {
    const { sistemaOperativo: dispSO, modelo: dispModelo, navegador: dispNavegador } = request.payload.dispositivo;

    const usuario = await Usuario.findOne({ $or: { nickname, correoElectronico: request.payload.correo } });
    const isValid = await bcrypt.compare(contrasenia, usuario.contrasenia);

    if (!isValid) {
      return { credentials: null, isValid: false, message: 'Credenciales no válidas' };
    }
    if (!dispSO && dispModelo ^ dispNavegador) {
      return { credentials: null, isValid: false, message: 'Debe usar un dispositivo válido' };
    }

    const credentials = {
      id: usuario._id,
      nombreCompleto: `${usuario.nombres} ${usuario.apellidos}`.trim(),
      sucursal: usuario.sucursal,
      nickname: usuario.nickname,
    };

    return { isValid, credentials };
  } catch (error) {
    return { isValid: false, credentials: null, message: error.message };
  }
};

exports.usuarioValido = async (session) => {
  const account = await Usuario.findById(session.id);

  if (!account || !account.activo) {
    return { isValid: false, valid: false, credentials: null };
  }

  const usuarioDatos = ['nombres', 'apellidos', 'nickname', 'correoElectronico', 'imagen', 'telefono', 'rol', 'sucursal'];

  const credentials = _.pick(account, usuarioDatos);
  credentials.id = account._id || account.id;
  credentials.scope = account.rol;

  return {
    valid: true,
    isValid: true,
    credentials,
  };
};
