/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
const Boom = require('@hapi/boom');
const { logInterceptor, logRequest, logResponse } = require('./logs');
const { printError } = require('./print');

function preResponse(request, h) {
  const { credentials } = request.auth;
  const sucursal = credentials ? credentials.sucursal : undefined;
  const usuario = credentials ? credentials.id : undefined;
  const [reqTags, reqText] = logRequest(request);
  const [resTags, resText] = logResponse(request);

  const { response } = request;
  const isApi = request.path.substr(1).toLowerCase().trim().split('/')[0].replace(/\//g, '') === 'api';

  isApi && logInterceptor(reqTags, reqText, sucursal, usuario);
  request.server.methods.db.updateLogs({ tags: reqTags, text: reqText, sucursal, usuario });
  isApi && logInterceptor(resTags, resText, sucursal, usuario);
  request.server.methods.db.updateLogs({ tags: resTags, text: resText, sucursal, usuario });

  if (response.isBoom) {
    const { statusCode, message } = response.output.payload;

    if (statusCode === 403 && message === 'Insufficient scope') {
      throw Boom.forbidden('Prohibido');
    } else if (statusCode === 401 && message === 'Missing authentication') {
      throw Boom.unauthorized('Sin autenticación');
    } else if (response && request.response.output && request.response.output.statusCode === 404) {
      // https://stackoverflow.com/questions/55649840/react-routing-with-hapi
      if (isApi) throw Boom.notFound(message);

      return h.file('dist/index.html');
    }
  }

  return h.continue;
}

function preStart(request, h) {}

function preAuth(request, h) {
  return h.continue;
}

async function preRequest(request, h) {
  try {
    const { origin } = request.headers;
    const isProd = process.env.NODE_ENV === 'production';
    const path = String(request.path).includes('/api') || String(request.path).includes('/login');

    if (isProd) {
      console.log('preRequest', origin, path);
    }
  } catch (error) {
    printError(error);
  }

  return h.continue;
}

module.exports = {
  preRequest,
  preResponse,
  preAuth,
  preStart,
};
