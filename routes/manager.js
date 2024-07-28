const controllers = require('../controllers');
const requestSchemas = require('../schemas/requests');
const { apiPrefix } = require('../utils/constants');
const route = require('../utils/route');

const managerPrefix = '/'.concat(apiPrefix, '/', 'manager');

module.exports = [
  route({
    method: 'POST',
    path: managerPrefix.concat('/lista'),
    tags: ['videos', 'archivos', 'videos', 'jugadas'],
    scope: ['ADMINISTRADOR', 'COACH'],
    strategies: ['session', 'token'],
    description: 'Crear una lista de jugadas',
    validations: {
      payload: requestSchemas.crearListaJugadasSchema,
    },
    func (req, h) {
      return controllers.crearLista(req, h);
    },
  }),
  route({
    method: 'GET',
    path: managerPrefix.concat('/listas'),
    tags: ['videos', 'archivos', 'videos', 'jugadas'],
    scope: ['ADMINISTRADOR', 'COACH', 'JUGADOR'],
    strategies: ['session', 'token'],
    description: 'Ver todas las listas de jugadas',
    validations: {
      query: requestSchemas.arbolJugadasSchema,
    },
    func (req, h) {
      return controllers.obtenerListas(req, h);
    },
  }),
  route({
    method: 'GET',
    path: managerPrefix.concat('/lista/{id}'),
    tags: ['videos', 'archivos', 'videos', 'jugadas'],
    scope: ['ADMINISTRADOR', 'COACH', 'JUGADOR'],
    strategies: ['session', 'token'],
    description: 'Ver lista de jugadas',
    validations: {
      params: requestSchemas.idSchema,
    },
    func (req, h) {
      return controllers.obtenerLista(req, h);
    },
  }),
  route({
    method: 'PUT',
    path: managerPrefix.concat('/lista/{id}'),
    tags: ['videos', 'archivos', 'videos', 'jugadas'],
    scope: ['ADMINISTRADOR', 'COACH'],
    strategies: ['session', 'token'],
    description: 'Modificar datos de una lista de jugadas',
    validations: {
      params: requestSchemas.idSchema,
      payload: requestSchemas.modificarListaJugadasSchema,
    },
    func (req, h) {
      return controllers.modificarLista(req, h);
    },
  }),
  route({
    method: 'PATCH',
    path: managerPrefix.concat('/lista/{id}'),
    tags: ['videos', 'archivos', 'videos', 'jugadas'],
    scope: ['ADMINISTRADOR', 'COACH'],
    strategies: ['session', 'token'],
    description: 'Habilitar una lista de jugadas',
    validations: {
      params: requestSchemas.idSchema,
    },
    func (req, h) {
      return controllers.habilitarLista(req, h);
    },
  }),
  route({
    method: 'DELETE',
    path: managerPrefix.concat('/lista/{id}'),
    tags: ['videos', 'archivos', 'videos', 'jugadas'],
    scope: ['ADMINISTRADOR', 'COACH'],
    strategies: ['session', 'token'],
    description: 'Eliminar una lista de jugadas',
    validations: {
      params: requestSchemas.idSchema,
    },
    func (req, h) {
      return controllers.eliminarLista(req, h);
    },
  }),
  route({
    method: 'POST',
    path: managerPrefix.concat('/jugada'),
    tags: ['videos', 'archivos', 'videos', 'jugadas'],
    scope: ['ADMINISTRADOR', 'COACH'],
    strategies: ['session', 'token'],
    description: 'Crear una jugada',
    validations: {
      payload: requestSchemas.crearJugadaSchema,
    },
    func (req, h) {
      return controllers.crearJugada(req, h);
    },
  }),
  route({
    method: 'POST',
    path: managerPrefix.concat('/jugadas'),
    tags: ['videos', 'archivos', 'videos', 'jugadas'],
    scope: ['ADMINISTRADOR', 'COACH'],
    strategies: ['session', 'token'],
    description: 'Crear varias jugadas',
    validations: {
      payload: requestSchemas.crearJugadasSchema,
    },
    func (req, h) {
      return controllers.crearJugadas(req, h);
    },
  }),
  route({
    method: 'GET',
    path: managerPrefix.concat('/jugada/{id}'),
    tags: ['videos', 'archivos', 'videos', 'jugadas'],
    scope: ['ADMINISTRADOR', 'COACH'],
    strategies: ['session', 'token'],
    description: 'Ver una jugada',
    validations: {
      params: requestSchemas.idSchema,
    },
    func (req, h) {
      return controllers.obtenerJugada(req, h);
    },
  }),
  route({
    method: 'PUT',
    path: managerPrefix.concat('/jugada/{id}'),
    tags: ['videos', 'archivos', 'videos', 'jugadas'],
    scope: ['ADMINISTRADOR', 'COACH'],
    strategies: ['session', 'token'],
    description: 'Modificar una jugada',
    validations: {
      params: requestSchemas.idSchema,
      payload: requestSchemas.modificarJugadaSchema,
    },
    func (req, h) {
      return controllers.modificarJugada(req, h);
    },
  }),
  route({
    method: 'PATCH',
    path: managerPrefix.concat('/jugada/{id}'),
    tags: ['videos', 'archivos', 'videos', 'jugadas'],
    scope: ['ADMINISTRADOR', 'COACH'],
    strategies: ['session', 'token'],
    description: 'Habilitar una jugada',
    validations: {
      params: requestSchemas.idSchema,
    },
    func (req, h) {
      return controllers.habilitarJugada(req, h);
    },
  }),
  route({
    method: 'DELETE',
    path: managerPrefix.concat('/jugada/{id}'),
    tags: ['videos', 'archivos', 'videos', 'jugadas'],
    scope: ['ADMINISTRADOR', 'COACH'],
    strategies: ['session', 'token'],
    description: 'Eliminar una jugada',
    validations: {
      params: requestSchemas.idSchema,
    },
    func (req, h) {
      return controllers.eliminarJugada(req, h);
    },
  }),
];
