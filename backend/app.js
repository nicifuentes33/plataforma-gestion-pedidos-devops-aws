
const express = require('express');
const path = require('node:path');

const pedidosRouter = require('./pedidos/api');
const productosRouter = require('./productos/api');

const app = express();

app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => {
  res.json({
    aplicacion: 'Plataforma de gestión de pedidos',
    version: '2.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ estado: 'ok' });
});

app.use('/pedidos', pedidosRouter);
app.use('/productos', productosRouter);

app.use(
  '/tienda',
  express.static(
    path.join(__dirname, '..', 'frontend')
  )
);

app.use((error, req, res, next) => {
  console.error(error);

  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({
      error: 'JSON inválido.'
    });
  }

  res.status(500).json({
    error: 'Error interno del servidor.'
  });
});

module.exports = app;
