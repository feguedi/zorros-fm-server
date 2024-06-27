/* eslint-disable consistent-return */
/* eslint-disable func-names */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
/* eslint-disable no-unused-expressions */
require('../config');
const { promisify } = require('util');
const Hapi = require('@hapi/hapi');
const Boom = require('@hapi/boom');
const Qs = require('qs');
const detect = promisify(require('detect-port'));

const conn = require('../db/connection');
const { printLog, printError } = require('../utils/print');
const { verificarPrimerAdmin } = require('../utils/admin');

const plugins = [];
const isDev = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

async function Server() {
  try {
    await conn();
    const port = await detect(process.env.PORT || 8080);
    const server = Hapi.server({
      port,
      host: process.env.HOST || '0.0.0.0',
      query: {
        parser: (query) => Qs.parse(query),
      },
      // tls,
      routes: {
        // https://morioh.com/p/3d5ffc21ace4
        cors: {
          origin: ['*'],
          credentials: true,
        },
      },
    });

    isDev && plugins.push(require('../plugins/pino'));
    plugins.push(require('@hapi/inert'));
    plugins.push(require('@hapi/jwt'));
    plugins.push(require('@hapi/cookie'));
    plugins.push(require('../plugins/autenticacion'));

    await server.register(plugins, { once: true });

    return server;
  } catch (error) {
    throw new Boom.Boom(error);
  }
}

exports.start = async function () {
  try {
    const server = await Server();
    printLog(await verificarPrimerAdmin());
    await server.start();
    printLog(`Servidor en: ${server.info.uri}`);

    return server;
  } catch (error) {
    printError(error);
    process.exit(1);
  }
};

exports.init = async function () {
  try {
    const server = await Server();
    await server.initialize();

    return server;
  } catch (error) {
    printError(error.message || error);
    process.exit(1);
  }
};
