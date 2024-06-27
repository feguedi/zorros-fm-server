const Boom = require('@hapi/boom');
const { printError } = require('./print');

module.exports = (error) => {
  printError(error);

  if (error.isJoi) {
    // Las propiedades que no existan dentro de cualquier objeto en la propiedad context tendrán un valor "undefined"
    // lo que significa que cualquiera de estas constantes puede tener un valor "undefined"
    const { details } = error;
    const contextKey = details[0].context.key ? details[0].context.key : details[0].context.label;
    const contextType = details[0].context.type;
    const contextPeers = details[0].context.peers;
    const contextLimit = details[0].context.limit;
    const contextMessage = details[0].context.message;

    const joiErr = {
      'any.required': {
        message: `El campo '${contextKey}' es requerido`,
        boomStatus: 'badRequest',
      },
      'any.unknown': {
        message: '???',
        boomStatus: 'notAcceptable',
      },
      'array.base': {
        message: `'${contextKey}' no es un arreglo`,
        boomStatus: 'badRequest',
      },
      'date.format': {
        message: `El formato de la fecha debe ser AAAA-MM-DD, DD-MM-AAAA, AAAA/MM/DD o DD/MM/AAAA`,
        boomStatus: 'badRequest',
      },
      'date.greater': {
        message: `${contextKey} debe ser mayor que ${contextLimit === 'now' ? 'la fecha y hora actual' : contextLimit}`,
        boomStatus: 'badRequest',
      },
      'date.ref': {
        message: `Internal Server Error`,
        boomStatus: 'badImplementation',
      },
      'date.base': {
        message: `${contextKey} debe ser una fecha válida`,
        boomStatus: 'badRequest',
      },
      'boolean.base': {
        message: `'${contextKey}' debe ser un valor booleano`,
        boomStatus: 'badRequest',
      },
      'object.base': {
        message: /must be of type object$/i.test(contextMessage) ? `'${contextKey}' debe ser un objeto` : 'Debe enviarse un objeto',
        boomStatus: 'badRequest',
      },
      'object.schema': {
        message: `'${contextKey}' debe ser de tipo ${contextType}`,
        boomStatus: 'notAcceptable',
      },
      'string.empty': {
        message: `El campo '${contextKey}' está vacío`,
        boomStatus: 'badRequest',
      },
      'string.alphanum': {
        message: `'${contextKey}' solo debe contener caracteres alfanuméricos`,
        boomStatus: 'badRequest',
      },
      'string.base': {
        message: `'${contextKey}' no es un string`,
        boomStatus: 'badRequest',
      },
      'string.email': {
        message: `'${contextKey}' no tiene un formato de correo electrónico`,
        boomStatus: 'badRequest',
      },
      'string.length': {
        message: `${contextKey} debe ser de ${contextLimit} caracteres`,
        boomStatus: 'badRequest',
      },
      'string.min': {
        message: `${contextKey} debe ser de al menos ${contextLimit} caracteres`,
        boomStatus: 'badRequest',
      },
      'string.max': {
        message: `${contextKey} no debe pasar de ${contextLimit} caracteres`,
        boomStatus: 'badRequest',
      },
      'string.pattern.base': {
        message: `${contextKey} no está en un formato correcto`,
        boomStatus: 'badRequest',
      },
      'number.base': {
        message: '???',
        boomStatus: 'notAcceptable',
      },
      'number.infinity': {
        message: '???',
        boomStatus: 'notAcceptable',
      },
      'number.integer': {
        message: `'${contextKey}' debe ser un número entero`,
        boomStatus: 'notAcceptable',
      },
      'number.min': {
        message: `'${contextKey}' debe ser un número de ${String(contextLimit).length} dígitos`,
        boomStatus: 'notAcceptable',
      },
      'number.greater': {
        message: `'${contextKey}' es un número grande`,
        boomStatus: 'notAcceptable',
      },
      'number.ref': {
        message: `Internal Server Error`,
        boomStatus: 'badImplementation',
      },
      'object.unknown': {
        message: `${contextKey} no está permitido`,
        boomStatus: 'badRequest',
      },
      'object.with': {
        message: `Cuando se envía '${details[0].context.main}', se debe enviar '${details[0].context.peer}'`,
        boomStatus: 'badRequest',
      },
      'object.missing': {
        message: `'${contextKey}' debe contener ${
          Array.isArray(contextPeers)
            ? contextPeers
                .map((peer, index, arr) =>
                  index !== arr.length || index !== arr.length + 1 ? `${peer},` : index !== arr.length ? peer : `o ${peer}`,
                )
                .join(' ')
            : contextPeers
        }`,
      },
    };

    const customErr = joiErr[details[0].type];

    throw customErr
      ? Boom[customErr.boomStatus](customErr.message) || Boom.badRequest(customErr.message)
      : Boom.badRequest(
          details
            .map(({ message }) => message.trim())
            .join('. ')
            .replace(/["]/g, '´'),
        );
  }

  if (error.name === 'ValidationError') {
    const errores = Object.keys(error.errors).map((key) => error.errors[key].message);
    throw Boom.badRequest(errores.join(', '));
  }

  if (Boom.isBoom(error)) {
    throw error;
  }

  throw new Boom.Boom(error);
};
