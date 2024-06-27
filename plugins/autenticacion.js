const { jwtTokenStrategy, cookieSession, googleCredentials } = require('../utils/strategies');

const authPlugin = {
  plugin: {
    name: 'dusant-autenticacion',
    version: '1.0.0',
    register(server) {
      server.auth.strategy('token', 'jwt', jwtTokenStrategy);
      server.auth.strategy('google', 'bell', googleCredentials(server.info.uri));
      server.auth.strategy('session', 'cookie', cookieSession);
    },
  },
};

module.exports = authPlugin;
