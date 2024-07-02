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
      required: true,
      default() {
        const nombreCompleto = this.uri.split('/')[this.uri.split('/').length - 1];
        const nombre = String(nombreCompleto).split(/[.](mp4|mkv|mov|avi)$/gi)[0];

        return `${nombre}-thumb.jpg`;
      },
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

module.exports = model('video', VideoSchema);
