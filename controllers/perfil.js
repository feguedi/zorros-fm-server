const Boom = require('@hapi/boom');

const Usuario = require('../models/Usuario');
const errorHandler = require('../utils/errors');

exports.verPerfil = async function (req) {
  try {
    const { id } = req.auth.credentials;
    const selector = ['nombre', 'nickname', 'imagen', 'rol', 'telefono'];
    const usuario = await Usuario.findOne({ _id: id, activo: true }, selector.join(' '));

    if (!usuario) {
      throw Boom.badRequest('');
    }

    const datosPerfil = _.pick(usuario, selector).toJSON();
    datosPerfil.id = id;

    return datosPerfil;
  } catch (error) {
    throw errorHandler(error);
  }
};

exports.modificarDatosPerfil = async function (req) {
  try {
    const { id } = req.auth.credentials;
    const { nombre } = req.payload;
    const usuario = await Usuario.findOne({ _id: id, activo: true });

    if (!usuario) {
      throw Boom.badRequest('No se puede modificar el usuario');
    }
    if (!usuario.activo) {
      throw Boom.badRequest('No se puede modificar el usuario');
    }
    if (campos.length === 0) {
      throw Boom.badRequest('No se enviaron datos');
    }

    usuario.nombre = nombre;
    await usuario.save();

    return { message: `Datos de "${usuario.nickname}" actualizados (nombre)` };
  } catch (error) {
    throw errorHandler(error);
  }
};
