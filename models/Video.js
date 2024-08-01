const { model, Schema, SchemaTypes } = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const VideoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
    },
    uri: {
      type: String,
      required: true,
      unique: true,
    },
    thumbnail: {
      type: String,
    },
    nota: {
      type: String,
    },
    autor: {
      type: SchemaTypes.ObjectId,
      ref: 'Usuario',
    },
  }, {
    timestamps: true,
  },
);

VideoSchema.plugin(uniqueValidator, { message: '"{VALUE}" ya está registrado como {PATH}' })

module.exports = model('Video', VideoSchema);
