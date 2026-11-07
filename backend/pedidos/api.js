
const express = require('express');
const store = require('../storage');

const {
  ESTADOS,
  comprobarPedido,
  nuevoPedido,
  validarTransicion
} = require('./pedidos');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const error = comprobarPedido(req.body);

    if (error) {
      return res.status(400).json({ error });
    }

    const pedido = nuevoPedido(req.body);
    await store.guardar(pedido);

    return res.status(201).json(pedido);
  } catch (e) {
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { estado, orden = 'desc' } = req.query;

    if (estado && !ESTADOS.includes(estado)) {
      return res.status(400).json({
        error: 'Estado no valido.'
      });
    }

    if (!['asc', 'desc'].includes(orden)) {
      return res.status(400).json({
        error: 'Orden debe ser asc o desc.'
      });
    }

    let datos = await store.listar();

    if (estado) {
      datos = datos.filter(p => p.estado === estado);
    }

    datos.sort((a, b) =>
      (
        a.fechaCreacion.localeCompare(b.fechaCreacion) ||
        a.id.localeCompare(b.id)
      ) * (orden === 'asc' ? 1 : -1)
    );

    return res.json(datos);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pedido = await store.obtener(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        error: 'Pedido no encontrado.'
      });
    }

    return res.json(pedido);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/estado', async (req, res, next) => {
  try {
    const { estado } = req.body || {};

    if (!ESTADOS.includes(estado)) {
      return res.status(400).json({
        error: 'Estado no valido.'
      });
    }

    const pedido = await store.obtener(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        error: 'Pedido no encontrado.'
      });
    }

    if (!validarTransicion(pedido.estado, estado)) {
      return res.status(409).json({
        error: 'Debe avanzar al siguiente estado; no se permiten retrocesos.'
      });
    }

    if (!await store.cambiarEstado(
      pedido.id, pedido.estado, estado
    )) {
      return res.status(409).json({
        error: 'Estado modificado concurrentemente; intente de nuevo.'
      });
    }

    return res.json({ ...pedido, estado });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
