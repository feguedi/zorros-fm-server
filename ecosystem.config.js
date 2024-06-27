module.exports = {
  apps: [
    {
      name: 'zorros-fm-server',
      script: './index.js',
      /*
      watch: ['config', 'controllers', 'db', 'lib', 'models', 'plugins', 'routes', 'schemas', 'utils', '.env', 'index.js'],
      ignore_watch: ['node_modules', '\\.git', '*.log', '.eslint*', '.prettier*', '.env.example'],
      */
    },
  ],
};
