/* eslint-disable no-unused-vars */
const { ServerRoute, RouteOptionsCache } = require('@hapi/hapi');
const Boom = require('@hapi/boom');
const { object: joiObject } = require('joi');

const { failAction } = require('./validation');

/**
 * @typedef Objeto
 * @type {object}
 * @property {object} directory - Directorio
 * @property {string} directory.path - Ruta relativa de los archivos
 * @property {string} directory.index - Ruta relativa del index.html
 */

/**
 * @typedef Validations
 * @type {object}
 * @property {joiObject} params Validación de los parámetros de la solicitud (/api/usuario/{nickname})
 * @property {joiObject} query Validación de los queries a la solicitud
 * @property {joiObject} payload Validación del cuerpo (o payload) enviado a la solicitud
 * @property {joiObject} headers Validación de los encabezados de la solicitud
 */

/**
 * @typedef CorsDefinition
 * @type {object}
 * @property {string[]|string} origin Arreglo de strings de servidores de origen permitidos. El arreglo pueden contener cualquier combinación completamente orígenes calificado junto con el string conteniendo un comodín '*'
 * @property {string[]} headers Arreglo de strings de cabeceras permitidas. Default: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match']
 * @property {number} maxAge Número de segundos que el navegador debería guardar en caché la respuesta del CORS
 * @property {boolean} credentials Si el valor es verdadero, permite el envío de credenciales del usuario
 */

/**
 * @typedef Datos
 * @type {object}
 * @property {ServerRoute.method} method Método (o verbo) HTTP de la solicitud
 * @property {string} path Ruta de la solicitud
 * @property {string} id ID de la ruta
 * @property {Array<string>} strategies Estrategias de autenticación (token o cookie)
 * @property {Array<string>} scope Alcance o tipos de usuario que podrán acceder a la ruta
 * @property {Array<string>|string} tags Etiquetas para clasificación de la ruta (documentación)
 * @property {string} description Descripción de la ruta (documentación)
 * @property {string} notes Notas de la ruta (documentación)
 * @property {false | RouteOptionsCache | undefined} cache Configuración de la caché
 * @property {joiObject} responseSchema Esquema del objeto que responderá la solicitud
 * @property {Validations} validations Tipos de validaciones para la solicitud
 * @property {number} rateLimitMax Número máximo de solicitudes que se harán a la ruta
 * @property {Object} plugins Plugins a agregar
 * @property {number} rateLimitDuration Tiempo límite para cubrir las solicitudes a la ruta
 * @property {CorsDefinition} cors Configuración CORS para la ruta
 * @property {ServerRoute.handler} func Función u objeto que ejecutará la solicitud
 */

/**
 * Ruta genérica para Hapi
 * @param {Datos} datos Objeto que tendrá la información de la solicitud
 * @returns {ServerRoute} Objeto con los valores de la ruta
 */
function route({
  method,
  path,
  id,
  strategies,
  scope,
  tags,
  description,
  notes,
  cache,
  responseSchema,
  validations,
  rateLimitMax,
  rateLimitDuration,
  cors,
  plugins,
  payload,
  func,
}) {
  // const swaggerPlugins = process.env.NODE_ENV !== 'production' ? require('../plugins/documentation').swaggerPlugins : {}
  const isObject = typeof func === 'object';
  async function handlerFunc(request, h) {
    try {
      if (isObject) {
        return;
      }

      // eslint-disable-next-line consistent-return
      return await func(request, h);
    } catch (error) {
      throw new Boom.Boom(error);
    }
  }

  const handler = isObject ? func : handlerFunc;

  const arrayTags = Array.isArray(tags) ? tags : tags && String(tags).length >= 1 ? [tags] : [];
  const autorizacion = {};
  const auth = {
    strategies,
    scope,
  };

  const validPayload =
    payload && Object.keys(payload).length > 0
      ? {
          payload,
        }
      : {};

  const validate =
    validations && Object.keys(validations).length > 0
      ? {
          failAction,
          ...validations,
        }
      : {};

  const defaultCors = {
    origin: (cors && cors.origin) || ['*'],
    headers: (cors && cors.headers) || ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'],
    maxAge: (cors && cors.maxAge) || 86400,
    credentials: (cors && cors.credentials) || true,
  };

  if (scope) {
    autorizacion.auth = {
      access: { scope },
    };
  }
  if (strategies) {
    autorizacion.auth = autorizacion.auth
      ? {
          ...autorizacion.auth,
          strategies,
        }
      : {
          strategies,
        };
  }

  const rateLimitObject = {
    rateLimitor: {
      max: rateLimitMax,
      duration: rateLimitDuration,
    },
  };
  const rateLimitPlugin = rateLimitMax && rateLimitDuration ? rateLimitObject : {};

  return {
    method,
    path,
    options: {
      ...autorizacion,
      cors: defaultCors,
      cache,
      tags: ['api', ...arrayTags],
      plugins: {
        // ...swaggerPlugins,
        ...plugins,
      },
      id,
      description,
      notes,
      response: {
        failAction: 'log',
        schema: responseSchema,
      },
      validate,
      ...validPayload,
    },
    handler,
  };
}

module.exports = route;
