/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */

module.exports = {
  plugin: require('hapi-pino'),
  options: {
    ignoredEventTags: {
      log: ['TEST'],
    },
    redact: ['request.headers.authorization', /* 'request.payload', */ 'request.query', 'response.payload'],
    logQueryParams: true,
    // logPayload: true,
    logPathParams: true,
    log4xxResponseErrors: true,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
};
