const Usuario = require('../models/Usuario');
const { crearAdministrador } = require('../controllers');
const errorHandler = require('./errors');

exports.verificarPrimerAdmin = async function () {
  try {
    const administradores = await Usuario.find({ rol: ['ADMINISTRADOR'], activo: true });

    if (!administradores || administradores.length === 0) {
      const datosAdmin = {
        nombre: process.env.FIRST_ADMIN_USER,
        nickname: process.env.FIRST_ADMIN_NICK,
        contrasenia: process.env.FIRST_ADMIN_PASS,
        telefono: process.env.FIRST_ADMIN_PHONE,
      };

      const { message } = await crearAdministrador(datosAdmin);

      return message;
    }

    return 'Ya existe un administrador';
  } catch (error) {
    throw errorHandler(error);
  }
};
