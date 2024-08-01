const { model, Schema, SchemaTypes } = require('mongoose');

const TipoEnum = {
  values: ['JUEGO', 'ENTRENAMIENTO', 'SCOUT'],
  message: '{VALUE} no es un tipo de listo válido',
};

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
    tipo: {
      type: String,
      enum: TipoEnum,
      required: [true, 'Se requiere el tipo de lista'],
      default: 'JUEGO',
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
