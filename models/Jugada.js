const { model, Schema, SchemaTypes } = require('mongoose');

const KindEnum = {
  values: ['OFFENSE', 'DEFENSE', 'PUNT', 'DRILL', 'KICKOFF RETURN', 'KICKOFF'],
  message: '{VALUE} no es un tipo de jugada válido',
};

const FieldSideEnum = {
  values: ['OWN', 'OPPONENT', 'MID'],
  message: '{VALUE} no es un tipo de lado del campo válido',
};

const JugadaSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Se requiere el nombre de la jugada'],
    },
    kind: {
      type: [
        {
          type: String,
          enum: KindEnum,
        },
      ],
      default: ['OFFENSE'],
      required: [true, 'Se requiere el tipo de jugada'],
    },
    meta: {
      type: {
        yard: Number,
        fieldSide: {
          type: String,
          enum: FieldSideEnum,
          default: 'OWN',
        },
        down: {
          type: Number,
          default: 1,
        },
        distance: {
          type: Number,
          default: 10,
        },
        offenseFormation: String,
        defenseFormation: String,
        motion: String,
      },
      required() {
        return this.kind.filter((k) => ['DRILL', 'KICKOFF', 'KICKOFF RETURN'].includes(k)).length > 0;
      },
    },
    sources: {
      type: [{
        type: SchemaTypes.ObjectId,
        ref: 'Video',
      }],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = model('Jugada', JugadaSchema);
