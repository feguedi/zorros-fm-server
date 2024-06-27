const Boom = require('@hapi/boom');
const bcrypt = require('bcrypt');

const Usuario = require('../models/Usuario');
const errorHandler = require('../utils/errors');

exports.crearUsuario = async function (req) {
  try {
    const { nombre, telefono } = req.payload;
    const hash = bcrypt.hashSync(telefono, 16);
    const nickname = String(nombre).toUpperCase().slice(0, 3).concat(String(telefono).slice(-4));
    const datos = {
      nombre,
      telefono,
      contrasenia: hash,
      nickname,
    };
    const usuarioNuevo = new Usuario(datos);
    await usuarioNuevo.save();

    return { message: `Usuario ${nickname} (${telefono}) creado` };
  } catch (error) {
    throw errorHandler(error);
  }
};

exports.recuperarContrasenia = async function (req) {
  try {
    return { message: `Ruta no disponible` };
  } catch (error) {
    throw errorHandler(error);
  }
};

exports.editarRoles = async function (req) {
  try {
    const { usuario: usuarioId, rol } = req.payload;

    if (rol.length === 0) {
      throw Boom.badRequest('Se envió un arreglo vacío');
    }

    const usuario = await Usuario.findOne({ _id: usuarioId, activo: true });

    usuario.rol.set([...rol]);

    await usuario.save();

    return { message: `${usuario.nickname} ahora es "${rol.join(', ')}"` };
  } catch (error) {
    throw errorHandler(error);
  }
};
