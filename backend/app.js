
const express = require('express');
const path = require('node:path');

const pedidosRouter = require('./pedidos/api');
const productosRouter = require('./productos/api');

const app = express();

// Interpretar solicitudes JSON normales.
app.use(express.json({ limit: '100kb' }));

// Compatibilidad con cuerpos recibidos como bytes en Lambda.
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';

  if (!contentType.toLowerCase().includes('application/json')) {
    return next();
  }

  let body = req.body;

  // No es necesario convertir un JSON ya procesado.
  if (body == null) {
    return next();
  }

  try {
    if (Buffer.isBuffer(body) || body instanceof Uint8Array) {
      body = Buffer.from(body).toString('utf8');

    } else if (
      typeof body === 'object' &&
      !Array.isArray(body)
    ) {
      const keys = Object.keys(body);

      // Algunos adaptadores entregan bytes como
      // un objeto con claves "0", "1", "2"...
      if (
        keys.length > 0 &&
        keys.every(key => /^\d+$/.test(key))
      ) {
        const bytes = keys
          .sort((a, b) => Number(a) - Number(b))
          .map(key => body[key]);

        if (
          bytes.some(value =>
            !Number.isInteger(value) ||
            value < 0 ||
            value > 255
          )
        ) {
          return res.status(400).json({
            error: 'Cuerpo JSON inválido.'
          });
        }

        body = Buffer.from(bytes).toString('utf8');
      }
    }

    if (typeof body === 'string') {
      if (Buffer.byteLength(body, 'utf8') > 102400) {
        return res.status(413).json({
          error: 'La solicitud supera el tamaño permitido.'
        });
      }

      req.body = JSON.parse(body);
    }

    return next();

  } catch {
    return res.status(400).json({
      error: 'El cuerpo de la solicitud no contiene JSON válido.'
    });
  }
});

// Información de la aplicación
app.get('/', (req, res) => {
  res.json({
    aplicacion: 'Plataforma de gestión de pedidos',
    version: '2.1'
  });
});

// Verificación del servidor
app.get('/health', (req, res) => {
  res.json({
    estado: 'ok'
  });
});

// Rutas de la API
app.use('/pedidos', pedidosRouter);
app.use('/productos', productosRouter);

// Frontend local
app.use(
  '/tienda',
  express.static(
    path.join(__dirname, '..', 'frontend')
  )
);

// Manejo de errores
app.use((error, req, res, next) => {
  console.error(error);

  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({
      error: 'JSON inválido.'
    });
  }

  return res.status(500).json({
    error: 'Error interno del servidor.'
  });
});

module.exports = app;
