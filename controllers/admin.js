const bcrypt = require('bcrypt');

const Usuario = require('../models/Usuario');
const errorHandler = require('../utils/errors');

exports.crearAdministrador = async function ({ nombre, contrasenia, telefono, nickname: nick }) {
  try {
    const hashedContrasenia = await bcrypt.hash(contrasenia, 10);
    const nickname = nick || String(nombre).toUpperCase().slice(0, 3).concat(String(telefono).slice(-4));

    const datosAdmin = {
      nombre,
      nickname,
      contrasenia: hashedContrasenia,
      telefono: Number.parseInt(telefono, 10),
      rol: ['ADMINISTRADOR'],
    };

    const admin = new Usuario(datosAdmin);
    await admin.save();

    return { message: 'Administrador creado' };
  } catch (error) {
    throw errorHandler(error);
  }
};
