const { printError } = require('./print');
const errorHandler = require('./errors');

exports.failAction = function failAction(request, h, error) {
  if (process.env.NODE_ENV !== 'production') {
    if (error.isJoi) {
      printError('==================');
      printError(JSON.stringify(error));
      printError('==================');
    }
  }

  throw errorHandler(error);
};
