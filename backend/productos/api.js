
const express = require('express');

const {
  CATEGORIAS,
  listarProductos,
  crearProducto,
  eliminarProducto
} = require('./catalogo');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    res.json(await listarProductos());
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      nombre,
      descripcion = '',
      precio,
      categoria = 'Otros',
      imagenUrl = '',
      emoji = ''
    } = req.body || {};

    if (
      typeof nombre !== 'string' ||
      !nombre.trim() ||
      nombre.length > 80 ||
      typeof descripcion !== 'string' ||
      descripcion.length > 200 ||
      typeof precio !== 'number' ||
      !Number.isFinite(precio) ||
      precio <= 0 ||
      !CATEGORIAS.includes(categoria) ||
      typeof imagenUrl !== 'string' ||
      typeof emoji !== 'string' ||
      emoji.length > 20
    ) {
      return res.status(400).json({
        error: 'Datos del producto inválidos.'
      });
    }

    if (imagenUrl) {
      try {
        const url = new URL(imagenUrl);

        if (
          !['http:', 'https:'].includes(url.protocol) ||
          imagenUrl.length > 1500
        ) {
          throw new Error('URL no válida');
        }
      } catch {
        return res.status(400).json({
          error: 'La URL de imagen no es válida.'
        });
      }
    }

    const producto = await crearProducto({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio,
      categoria,
      imagenUrl: imagenUrl.trim(),
      emoji: emoji.trim()
    });

    return res.status(201).json(producto);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const borrado = await eliminarProducto(req.params.id);

    if (!borrado) {
      return res.status(404).json({
        error: 'Producto no encontrado.'
      });
    }

    return res.json({
      mensaje: 'Producto eliminado del catálogo.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
