const Boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const dateFns = require('date-fns');

const Usuario = require('../models/Usuario');
const errorHandler = require('../utils/errors');
const { generateToken } = require('../utils/auth');

exports.login = async function (req) {
  try {
    const { telefono, contrasenia } = req.payload;
    const selector = ['id', 'nombre', 'contrasenia', 'telefono', 'nickname', 'rol'];

    const isNumber = !Number.isNaN(telefono);

    if (!isNumber) {
      throw Boom.badRequest('Datos mal enviados');
    }

    const usuarioValido = await Usuario.findOne({ telefono }, [...selector, 'activo', 'nuevo', 'createdAt'].join(' '));

    if (!usuarioValido) {
      throw Boom.badRequest('Usuario no válido');
    }
    if (!usuarioValido.activo) {
      throw Boom.badRequest('Habla con el administrador');
    }

    const isValid = bcrypt.compareSync(contrasenia, usuarioValido.contrasenia);

    if (!isValid) {
      throw Boom.badRequest('Usuario no válido');
    }

    const credenciales = {};

    selector.forEach((c) => {
      if (usuarioValido[c]) {
        if (!Array.isArray(usuarioValido[c]) || (Array.isArray(usuarioValido[c]) && usuarioValido[c].length > 0)) {
          credenciales[c] = usuarioValido[c];
        }
      }
    });

    credenciales.id = usuarioValido._id;
    const token = generateToken(credenciales);

    req.cookieAuth.set(credenciales);

    const obj = {
      message: 'Credenciales correctas',
      token,
      rol: credenciales.rol,
    };

    if (usuarioValido.nuevo) {
      obj.nuevo = 'El usuario debe cambiar la contraseña';
    }

    return obj;
  } catch (error) {
    throw errorHandler(error);
  }
};
