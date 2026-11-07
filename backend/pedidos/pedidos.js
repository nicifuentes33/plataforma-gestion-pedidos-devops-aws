
const { randomUUID } = require('node:crypto');

const ESTADOS = [
  'Pendiente',
  'En Proceso',
  'Enviado',
  'Entregado'
];

function comprobarPedido(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return 'Envíe un objeto JSON.';
  }

  const { cliente, direccionEnvio, productos } = datos;

  if (
    !cliente ||
    typeof cliente.nombre !== 'string' ||
    !cliente.nombre.trim() ||
    typeof cliente.telefono !== 'string' ||
    !cliente.telefono.trim()
  ) {
    return 'El cliente requiere nombre y telefono.';
  }

  if (
    typeof direccionEnvio !== 'string' ||
    !direccionEnvio.trim()
  ) {
    return 'La direccionEnvio es obligatoria.';
  }

  if (!Array.isArray(productos) || productos.length === 0) {
    return 'Agregue al menos un producto.';
  }

  for (const p of productos) {
    if (
      !p ||
      typeof p.nombre !== 'string' ||
      !p.nombre.trim() ||
      !Number.isSafeInteger(p.cantidad) ||
      p.cantidad <= 0 ||
      typeof p.precio !== 'number' ||
      !Number.isFinite(p.precio) ||
      p.precio < 0
    ) {
      return 'Cada producto requiere nombre, cantidad entera positiva y precio no negativo.';
    }
  }

  return null;
}

function nuevoPedido(datos) {
  return {
    id: randomUUID(),
    cliente: {
      nombre: datos.cliente.nombre.trim(),
      telefono: datos.cliente.telefono.trim()
    },
    direccionEnvio: datos.direccionEnvio.trim(),
    productos: datos.productos.map(p => ({
      nombre: p.nombre.trim(),
      cantidad: p.cantidad,
      precio: p.precio
    })),
    total: datos.productos.reduce(
      (ac, p) => ac + p.cantidad * p.precio, 0
    ),
    estado: ESTADOS[0],
    fechaCreacion: new Date().toISOString()
  };
}

function validarTransicion(actual, siguiente) {
  const a = ESTADOS.indexOf(actual);
  const b = ESTADOS.indexOf(siguiente);

  return a >= 0 && b === a + 1;
}

module.exports = {
  ESTADOS,
  comprobarPedido,
  nuevoPedido,
  validarTransicion
};
