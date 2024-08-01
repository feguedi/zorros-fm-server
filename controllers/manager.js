const Boom = require('@hapi/boom');
const mongoose = require('mongoose');
const _ = require('underscore');
const Jugada = require('../models/Jugada');
const Lista = require('../models/Lista');
const errorHandler = require('../utils/errors');

function isValidID(_id) {
  return mongoose.Types.ObjectId.isValid(_id);
}

function getID(obj = { id: '' }) {
  const { id } = obj;

  if (!isValidID(id)) {
    throw Boom.badRequest('Datos mal enviados');
  }

  return { id };
}

exports.crearJugada = async function (req, h) {
  try {
    const { nombre: name, tipo: kind, meta, sources } = req.payload;
    const jugadaNueva = new Jugada({ name, kind, meta, sources });

    await jugadaNueva.save();

    return { message: `Se creó ${name} con ${sources.length} video${sources.length === 1 ? '' : 's'}` };
  } catch (error) {
    throw errorHandler(error);
  }
}

exports.crearJugadas = async function (req, h) {
  try {
    const { jugadas } = req.payload;
    const metaKeys = ['yard', 'fieldSide', 'down', 'distance', 'offenseFormation', 'defenseFormation', 'motion'];

    const promesas = jugadas.map((j) => new Promise((resolve, reject) => {
      const datos = { name: j.nombre };

      if (Array.isArray(j.tipo) && j.tipo.length > 0) {
        datos.kind = j.tipo;
      }
      if (typeof j.meta === 'object' && Object.keys(j.meta).length > 0) {
        metaKeys.forEach((k) => {
          datos.meta[k] = j.meta[k];
        });
      }
      if (Array.isArray(j.sources) && j.sources.length > 0) {
        const sourcesSet = new Set(j.sources.filter((s) => isValidID(s)));
        datos.sources = [...sourcesSet];
      }

      const jugadaNueva = new Jugada(datos);

      jugadaNueva.save()
        .then(() => resolve({ message: `Jugada "${j.nombre}" creada` }))
        .catch((error) => reject({
          message: `No se pudo registrar la jugada "${j.nombre}" (${error.message || error})`,
          values: j,
          error,
        }));
    }));

    const prom = await Promise.allSettled(promesas);
    const resueltas = prom.filter((p) => p.status === 'fulfilled');
    const errores = prom.filter((p) => p.status === 'rejected');

    const resp = {};

    if (errores.length > 0 || resueltas.length === 0) {
      const set = new Set(errores.map(({ reason }) => reason.message || 'Error'));
      resp.errores = [...set].join('. ');
    }
    if (resueltas.length === 0) {
      throw Boom.badRequest(resp.errores);
    }

    resp.message = `Se registraron ${resueltas.length} jugada${resueltas.length === 1 ? '' : 's'} correctamente`;

    return resp;
  } catch (error) {
    throw errorHandler(error);
  }
}

exports.obtenerJugada = async function (req, h) {
  try {
    const { id } = getID(req.params);

    const jugada = await Jugada.findById(id, 'name kind meta sources activa createdAt updatedAt')
      .populate('sources', 'nombre uri thumbnail nota autor');

    if (!jugada || (jugada && !jugada.activa)) {
      throw Boom.notFound('No se encontró la jugada');
    }

    return jugada;
  } catch (error) {
    throw errorHandler(error);
  }
}

exports.modificarJugada = async function (req, h) {
  try {
    const { id } = getID(req.params);
    const { nombre: name, tipo: kind, meta, sources } = req.payload;
    const jugadaSelector = ['name', 'kind', 'meta', 'sources'];
    const metaKeys = ['yard', 'fieldSide', 'down', 'distance', 'offenseFormation', 'defenseFormation', 'motion'];

    const jugada = await Jugada.findById(id);

    if (!jugada || (jugada && !jugada.activa)) {
      throw Boom.notFound('No se encontró la jugada');
    }

    const cambios = jugadaSelector.filter((s) => !!req.payload[s]);

    if (cambios.length === 0) {
      throw Boom.badRequest('No se enviaron datos');
    }

    if (name) {
      jugada.name = name;
    }
    if (kind) {
      jugada.kind = kind;
    }
    if (typeof meta === 'object' && Object.keys(meta).length > 0) {
      metaKeys.forEach((k) => {
        if (meta[k]) {
          jugada.meta[k] = meta[k];
        }
      });
    }
    if (Array.isArray(sources) && sources.length > 0) {
      const vidsSet = new Set(sources.filter((s) => isValidID(s)));
      jugada.sources = [...vidsSet];
    }

    await jugada.save();

    return { message: `Jugada ${jugada.name} cambió en ${cambios.join(', ')}` };
  } catch (error) {
    throw errorHandler(error);
  }
}

exports.habilitarJugada = async function (req, h) {
  try {
    const { id } = getID(req.params);

    const jugada = await Jugada.findById(id);

    if (!jugada) {
      throw Boom.notFound('Jugada no encontrada');
    }
    if (jugada.activa) {
      throw Boom.badRequest('Jugada ya habilitada');
    }

    jugada.activa = true;

    await jugada.save();

    return { message: `Jugada ${jugada.name} habilitada` };
  } catch (error) {
    throw errorHandler(error);
  }
}

exports.eliminarJugada = async function (req, h) {
  try {
    const { id } = getID(req.params);

    const jugada = await Jugada.findById(id);

    if (!jugada || !jugada.activa) {
      throw Boom.notFound('Jugada no encontrada');
    }

    jugada.activa = false;

    await jugada.save();

    return { message: `Jugada ${jugada.name} eliminada` };
  } catch (error) {
    throw errorHandler(error);
  }
}
  
exports.crearLista = async function (req, h) {
  try {
    const { id: autor } = req.auth.credentials;
    const { nombre, jugadas, notas, tipo } = req.payload;
    const datos = { nombre, autor };

    if (Array.isArray(jugadas) && jugadas.length > 0) {
      const jugadasSet = new Set(jugadas.filter((j) => isValidID(j)));
      datos.jugadas = [...jugadasSet];
    }
    if (notas) {
      datos.notas = notas;
    }
    if (tipo) {
      datos.tipo = tipo;
    }

    const listaNueva = new Lista(datos);

    await listaNueva.save();

    return { id: listaNueva.id, message: `Se creó la lista "${listaNueva.id}"`,  };
  } catch (error) {
    throw errorHandler(error);
  }
}

exports.obtenerListas = async function (req, h) {
  try {
    const { arbol } = req.query;
    const listaSelector = ['nombre', 'activa', 'tipo'];
    const arbolSelector = ['jugadas', 'notas', 'autor', 'createdAt', 'updatedAt'];
    const autorSelector = ['_id', 'nombre', 'nickname', 'imagen'];
    const jugadasSelector = ['_id', 'name', 'kind', 'sources'];
    const sourcesSelector = ['_id', 'nombre', 'thumbnail'];
    const project = {
      jugadas: {
        _id: 1,
        name: 1,
        kind: 1,
        meta: 1,
        sources: {
          _id: 1,
          nombre: 1,
          thumbnail: 1,
          uri: 1,
          createdAt: 1,
          updatedAt: 1,
        },
        createdAt: 1,
        updatedAt: 1,
      },
      nombre: 1,
      autor: {
        _id: 1,
        nickname: 1,
        nombre: 1,
        imagen: 1,
      },
      tipo: 1,
    };

    const projectArbol = { _id: 1 };

    [...listaSelector, ...arbolSelector].forEach((s) => {
      if (s !== 'jugadas' || s !== 'autor') {
        projectArbol[s] = 1;
      }
      if (s === 'jugadas') {
        projectArbol.jugadas = {};
      }
      if (s === 'autor') {
        projectArbol.autor = {};
      }
    });

    jugadasSelector.forEach((s) => {
      if (s === 'sources') {
        projectArbol.jugadas.sources = {};
      } else {
        projectArbol.jugadas[s] = 1;
      }
    });

    sourcesSelector.forEach((s) => {
      projectArbol.jugadas.sources[s] = 1;
    });

    autorSelector.forEach((s) => {
      projectArbol.autor[s] = 1;
    });

    const listas = await Lista.aggregate([
      {
        $match: {
          activa: true,
        },
      }, {
        $lookup: {
          from: 'usuarios', 
          localField: 'autor', 
          foreignField: '_id', 
          as: 'autor',
        },
      }, {
        $unwind: '$autor',
      }, {
        $lookup: {
          from: 'jugadas', 
          localField: 'jugadas', 
          foreignField: '_id', 
          as: 'jugadas',
        },
      }, {
        $lookup: {
          from: 'videos', 
          localField: 'jugadas.sources', 
          foreignField: '_id', 
          as: 'videos',
        },
      }, {
        $addFields: {
          jugadas: {
            $map: {
              input: '$jugadas', 
              as: 'jugada', 
              in: {
                _id: '$$jugada._id', 
                name: '$$jugada.name', 
                kind: '$$jugada.kind', 
                meta: '$$jugada.meta', 
                activa: '$$jugada.activa', 
                sources: {
                  $filter: {
                    input: '$videos', 
                    as: 'video', 
                    cond: {
                      $and: [
                        { $in: ['$$video._id', '$$jugada.sources'] },
                        { $eq: ['$$video.activo', true] }
                      ],
                    },
                  },
                }, 
                createdAt: '$$jugada.createdAt', 
                updatedAt: '$$jugada.updatedAt',
              },
            },
          },
        },
      }, {
        $project: arbol
        ? projectArbol
        : project,
      },
    ]);

    return listas;
  } catch (error) {
    throw errorHandler(error);
  }
}

exports.obtenerLista = async function (req, h) {
  try {
    const { id } = getID(req.params);
    const listaSelector = ['nombre', 'jugadas', 'notas', 'autor', 'activa', 'createdAt', 'updatedAt'];

    const lista = await Lista.findById(id, listaSelector.join(' '))
      .populate('autor', 'nombre nickname imagen')
      .populate('jugadas', 'name kind meta sources createdAt updatedAt')
      .populate('jugadas.sources', 'nombre uri thumbnail nota autor createdAt updatedAt')
      .populate('jugadas.sources.autor', 'nombre nickname imagen');

    if (!lista || (lista && !lista.activa)) {
      throw Boom.notFound('Lista no encontrada');
    }

    return lista;
  } catch (error) {
    throw errorHandler(error);
  }
}

exports.modificarLista = async function (req, h) {
  try {
    const { id } = req.params;
    const { nombre, jugadas, notas } = req.payload;

    if (!isValidID(id)) {
      throw Boom.badRequest('Datos mal enviados');
    }

    const lista = await Lista.findById(id);

    if (!lista || (lista && !lista.activa)) {
      throw Boom.notFound('Lista no encontrada');
    }

    const cambios = ['nombre', 'jugadas', 'notas'].filter((c) => !!req.payload[c]);

    if (cambios.length === 0) {
      throw Boom.badRequest('No se enviaron datos');
    }

    if (typeof nombre === 'string' && nombre.length > 0) {
      lista.nombre = nombre;
    }
    if (Array.isArray(jugadas) && jugadas.length > 0) {
      const jugadasSet = new Set(jugadas.filter((j) => isValidID(j)));
      lista.jugadas = [...jugadasSet];
    }
    if (typeof notas === 'string' && notas.length > 0) {
      lista.notas = notas;
    }

    await lista.save();

    return { message: `Lista ${lista.nombre} cambió en ${cambios.join(', ')}` };
  } catch (error) {
    throw errorHandler(error);
  }
}

exports.habilitarLista = async function (req, h) {
  try {
    const { id } = req.params;

    if (!isValidID(id)) {
      throw Boom.badRequest('Datos mal enviados');
    }

    const lista = await Lista.findById(id);

    if (!lista) {
      throw Boom.notFound('Lista no encontrada');
    }
    if (lista.activa) {
      throw Boom.badRequest('Lista ya habilitada');
    }

    lista.activa = true;

    await lista.save();

    return { message: `Lista ${lista.nombre} habilitada` };
  } catch (error) {
    throw errorHandler(error);
  }
}

exports.eliminarLista = async function (req, h) {
  try {
    const { id } = req.params;

    if (!isValidID(id)) {
      throw Boom.badRequest('Datos mal enviados');
    }

    const lista = await Lista.findById(id);

    if (!lista || (lista && !lista.activa)) {
      throw Boom.notFound('Lista no encontrada');
    }

    lista.activa = false;

    await lista.save();

    return { message: `Lista ${lista.nombre} eliminada` };
  } catch (error) {
    throw errorHandler(error);
  }
}
