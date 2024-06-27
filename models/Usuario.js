/* eslint-disable no-unused-vars */
const { Schema, model, SchemaTypes } = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const rolesValidos = {
  values: ['COACH', 'ADMINISTRADOR'],
  message: '{VALUE} no es un rol de usuario válido',
};

const UsuarioSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
    },
    nickname: {
      type: String,
      required: [true, 'El nickname es requerido'],
      index: true,
      unique: true,
    },
    imagen: {
      type: String,
    },
    contrasenia: {
      type: String,
      required: [true, 'La contraseña es requerida'],
    },
    rol: {
      type: [
        {
          type: String,
          enum: rolesValidos,
          required: [true, 'El rol de usuario es requerido'],
        },
      ],
      default: ['COACH'],
      index: true,
    },
    telefono: {
      type: Number,
      unique: true,
      required: [true, 'Se requiere el teléfono del usuario'],
    },
    activo: {
      type: Boolean,
      default: true,
      required: true,
    },
    nuevo: {
      type: Boolean,
      default: true,
      required: true,
    },
    recoverHash: [
      {
        hash: {
          type: String,
          required: true,
        },
        dateCreated: {
          type: Date,
          default: Date.now(),
        },
        checked: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

UsuarioSchema.plugin(uniqueValidator, { message: '"{VALUE}" ya está registrado como {PATH}' });

module.exports = model('Usuario', UsuarioSchema);
