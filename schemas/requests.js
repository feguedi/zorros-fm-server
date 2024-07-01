const Joi = require('joi');

exports.loginSchema = Joi.object({
  usuario: Joi.number().integer().min(1000000000).max(9999999999).required(),
  contrasenia: Joi.string().min(3).required(),
}).label('loginRequestSchema');

exports.crearUsuarioSchema = Joi.object({
  nombre: Joi.string().min(3).required(),
  telefono: Joi.number().integer().min(1000000000).max(9999999999).required(),
  rol: Joi.string().valid('COACH', 'ADMINISTRADOR').default('COACH'),
}).label('crearUsuarioSchema');
