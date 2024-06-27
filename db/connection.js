const { connect } = require('mongoose');
const Boom = require('@hapi/boom');

const { BD_USER } = process.env;
const { BD_PASS } = process.env;
const { BD_HOST } = process.env;
const { BD_PORT } = process.env;
const { BD_NAME } = process.env;
const { BD_CNN } = process.env;

const isDevelopment = process.env.NODE_ENV !== 'production';
const productionURI = !BD_USER || !BD_PASS || !BD_HOST ? BD_CNN : `mongodb+srv://${BD_USER}:${BD_PASS}@${BD_HOST}/${BD_NAME}`;
const devURI = !BD_HOST || !BD_PORT || !BD_NAME ? BD_CNN : `mongodb://${BD_HOST}:${BD_PORT}/${BD_NAME}`;
const uri = isDevelopment ? devURI : productionURI; // Identificador uniforme de recursos

// Opciones para conexión a MongoDB
// Sería el segundo argumento de la función "connect"
// await connect(uri, mongooseOptions)
// En la versión 6.2 de mongoose salta un error cuando se agregan estas opciones
// http://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient.html
const mongooseOptions = {};

module.exports = async function startBD() {
  try {
    await connect(uri, mongooseOptions);
    console.log('Base de datos corriendo');
  } catch (error) {
    console.error('Error en la conexión de la base de datos.', error);
    throw Boom.serverUnavailable('Error en la conexión de la base de datos');
  }
};
