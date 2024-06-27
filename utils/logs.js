/* eslint-disable no-underscore-dangle */
const Log = require('../models/Log.js');
// https://www.techighness.com/post/hook-node-js-console-log-insert-in-mongodb

const writeLogs = async (log) => {
  try {
    const _log = new Log(log);
    await _log.save();
  } catch (error) {
    console.error('Imposible guardar el log');
    console.error(error);
  }
};

/**
 * Grabar logs en la base de datos
 * @param {String[]} tags Tags del log
 * @param {String} texto Mensaje que se imprimiría
 * @param {String|undefined} usuario ID del usuario
 */
exports.logInterceptor = async (_tags, texto, usuario) => {
  const tags = Array.isArray(_tags) && _tags.length > 0 ? _tags : typeof _tags === 'string' ? [_tags] : [];
  const log = {
    texto,
    tags,
    usuario,
  };

  await writeLogs(log);
};

exports.logResponse = (request) => {
  // const pinoLevels = ['INFO', 'TRACE', 'DEBUG', 'WARN', 'ERROR']
  const { response } = request;
  const { statusCode } = response;
  const message = response.isBoom && response.output.payload.message;

  const objResponse = {
    message: message || undefined,
    statusCode: statusCode || undefined,
  };

  const _objResponse = {};
  Object.keys(objResponse)
    .filter((key) => !!objResponse[key])
    .forEach((key) => {
      _objResponse[key] = objResponse[key];
    });

  const logResponse = {
    tags: [
      String(request.method).toUpperCase(),
      request.path,
      statusCode >= 400 ? 'ERROR' : statusCode >= 300 ? 'TRACE' : statusCode >= 200 ? 'INFO' : 'DEBUG',
      'response',
    ],
    text: Object.keys(_objResponse).length > 0 ? JSON.stringify(_objResponse) : '',
  };

  return [logResponse.tags, logResponse.text];
};

/**
 * Crea un objeto para enviar a los logs
 * @param {object} request Objeto con elementos de la solicitud de hapi
 */
exports.logRequest = (request) => {
  const { isAuthenticated } = request.auth;
  const { isAuthorized } = request.auth;

  const objRequest = {
    payload: request.payload ? request.payload : undefined,
    params: request.params && Object.keys(request.params).length > 0 ? request.params : undefined,
    nombre: isAuthenticated && isAuthorized ? `${request.auth.credentials.apellidos}, ${request.auth.credentials.nombres}` : undefined,
    nickname: isAuthenticated && isAuthorized ? request.auth.credentials.nickname : undefined,
    id: isAuthenticated && isAuthorized ? request.auth.credentials.id : undefined,
    strategy: request.auth.strategy ? request.auth.strategy : undefined,
  };

  const _objRequest = {};
  Object.keys(objRequest)
    .filter((key) => !!objRequest[key])
    .forEach((key) => {
      _objRequest[key] = objRequest[key];
    });

  const logRequest = {
    tags: [String(request.method).toUpperCase(), request.path, 'INFO', 'request'],
    text: Object.keys(_objRequest).length > 0 ? JSON.stringify(_objRequest) : '',
  };

  return [logRequest.tags, logRequest.text];
};
