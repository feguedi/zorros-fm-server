const { model, Schema, SchemaTypes } = require('mongoose');

const ListaSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'Se requiere el nombre de la jugada'],
      defaut: Date.now(),
    },
    jugadas: {
      type: [{
        type: SchemaTypes.ObjectId,
        ref: 'Jugada',
        required: true,
      }],
      default: [],
    },
    notas: String,
    autor: {
      type: SchemaTypes.ObjectId,
      ref: 'Usuario',
      required: [true, 'Se requiere el autor de la lista'],
    },
    activa: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = model('Lista', ListaSchema);
