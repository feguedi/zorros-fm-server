const Joi = require('joi');

exports.idSchema = Joi.object({
  id: Joi.string().alphanum().min(18).max(24).required(),
}).label('idSchema');

exports.loginSchema = Joi.object({
  usuario: Joi.number().integer().min(1000000000).max(9999999999).required(),
  contrasenia: Joi.string().min(3).required(),
}).label('loginRequestSchema');

exports.crearUsuarioSchema = Joi.object({
  nombre: Joi.string().min(3).required(),
  telefono: Joi.number().integer().min(1000000000).max(9999999999).required(),
  rol: Joi.string().valid('COACH', 'ADMINISTRADOR').default('COACH'),
}).label('crearUsuarioSchema');

exports.modificarDatosUsuarioSchema = Joi.object({
  nombre: Joi.string().min(2).required(),
}).label('modificarDatosUsuarioSchema');

const jugadaMetaSchema = Joi.object({
  yard: Joi.number().integer().min(1).max(50),
  fieldSide: Joi.string().valid('OWN', 'OPPONENT', 'MID'),
  down: Joi.number().integer().min(1).max(4),
  distance: Joi.number().integer().min(1).max(99),
  offenseFormation: Joi.string().min(1),
  defenseFormation: Joi.string().min(1),
  motion: Joi.string().min(1),
}).label('jugadaMetaSchema');

exports.crearJugadaSchema = Joi.object({
  nombre: Joi.string().required(),
  meta: jugadaMetaSchema,
  tipo: Joi.array().items(Joi.string().valid('OFFENSE', 'DEFENSE', 'DRILL', 'KICKOFF', 'KICKOFF RETURN', 'PUNT')),
  sources: Joi.array().items(Joi.string().alphanum().min(18).max(24)),
}).label('crearJugadaSchema');

exports.crearJugadasSchema = Joi.object({
  jugadas: Joi.array().items(this.crearJugadaSchema).required(),
}).label('crearJugadasSchema');

exports.modificarJugadaSchema = Joi.object({
  nombre: Joi.string(),
  meta: jugadaMetaSchema,
  tipo: Joi.array().items(Joi.string().valid('OFFENSE', 'DEFENSE', 'DRILL', 'KICKOFF', 'KICKOFF RETURN', 'PUNT')),
  sources: Joi.array().items(Joi.string().alphanum().min(18).max(24)),
}).label('modificarJugadaSchema');

exports.crearListaJugadasSchema = Joi.object({
  nombre: Joi.string().required(),
  jugadas: Joi.array().items(Joi.string().alphanum().min(18).max(24)),
  notas: Joi.string(),
}).label('crearListaJugadasSchema');

exports.modificarListaJugadasSchema = Joi.object({
  nombre: Joi.string(),
  jugadas: Joi.array().items(Joi.string().alphanum().min(18).max(24)),
  notas: Joi.string(),
}).label('modificarListaJugadasSchema');

exports.arbolJugadasSchema = Joi.object({
  arbol: Joi.bool().default(false),
}).label('arbolJugadaSchema');

exports.nombreArchivoSchema = Joi.object({
  nombre: Joi.string().required(),
}).label('nombreArchivoSchema');

exports.subirVideoConMiniaturaSchema = Joi.object({
  // files: Joi.array().single(),
  archivo: Joi.any().required(),
  nombre: Joi.string(),
  thumbnail: Joi.any(),
}).label('subirVideoConMiniaturaSchema');
