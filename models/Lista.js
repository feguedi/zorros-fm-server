const { model, Schema, SchemaTypes } = require('mongoose');

const ListaSchema = new Schema(
  {
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
  },
  {
    timestamps: true,
  },
);

module.exports = model('Lista', ListaSchema);
