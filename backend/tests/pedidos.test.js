
const test = require('node:test');
const assert = require('node:assert/strict');

const app = require('../app');
const { limpiarLocal } = require('../storage');

const datos = () => ({
  cliente: {
    nombre: 'Cliente de prueba',
    telefono: '3001234567'
  },
  direccionEnvio: 'Calle 10 # 5-20',
  productos: [
    {
      nombre: 'Hamburguesa',
      cantidad: 2,
      precio: 18000
    }
  ]
});

let servidor;
let base;

test.before(async () => {
  limpiarLocal();

  servidor = app.listen(0);

  await new Promise(resolve =>
    servidor.once('listening', resolve)
  );

  base = `http://127.0.0.1:${servidor.address().port}`;
});

test.after(() =>
  new Promise((resolve, reject) =>
    servidor.close(error =>
      error ? reject(error) : resolve()
    )
  )
);

async function solicitar(metodo, ruta, cuerpo) {
  const respuesta = await fetch(base + ruta, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json'
    },
    body: cuerpo
      ? JSON.stringify(cuerpo)
      : undefined
  });

  return {
    status: respuesta.status,
    body: await respuesta.json()
  };
}

test('salud responde 200', async () => {
  const respuesta = await solicitar(
    'GET',
    '/health'
  );

  assert.equal(respuesta.status, 200);
});

test('crea, consulta, filtra y ordena pedidos', async () => {
  const uno = await solicitar(
    'POST',
    '/pedidos',
    datos()
  );

  assert.equal(uno.status, 201);
  assert.equal(uno.body.total, 36000);
  assert.equal(uno.body.estado, 'Pendiente');
  assert.ok(uno.body.fechaCreacion);

  const dos = await solicitar(
    'POST',
    '/pedidos',
    datos()
  );

  assert.equal(dos.status, 201);
  assert.notEqual(uno.body.id, dos.body.id);

  const consulta = await solicitar(
    'GET',
    `/pedidos/${uno.body.id}`
  );

  assert.equal(
    consulta.body.direccionEnvio,
    datos().direccionEnvio
  );

  const filtrados = await solicitar(
    'GET',
    '/pedidos?estado=Pendiente&orden=asc'
  );

  assert.equal(filtrados.status, 200);
  assert.ok(filtrados.body.length >= 2);

  const ordenados = await solicitar(
    'GET',
    '/pedidos?orden=desc'
  );

  assert.ok(ordenados.body.length >= 2);

  assert.ok(
    ordenados.body[0].fechaCreacion >=
    ordenados.body[1].fechaCreacion
  );
});

test('avanza estados secuencialmente', async () => {
  const respuesta = await solicitar(
    'POST',
    '/pedidos',
    datos()
  );

  const pedido = respuesta.body;

  for (const estado of [
    'En Proceso',
    'Enviado',
    'Entregado'
  ]) {
    const actualizacion = await solicitar(
      'PATCH',
      `/pedidos/${pedido.id}/estado`,
      { estado }
    );

    assert.equal(actualizacion.status, 200);
    assert.equal(actualizacion.body.estado, estado);
  }

  const retroceso = await solicitar(
    'PATCH',
    `/pedidos/${pedido.id}/estado`,
    { estado: 'Pendiente' }
  );

  assert.equal(retroceso.status, 409);
});

test('rechaza datos y filtros invalidos', async () => {
  const sinProductos = await solicitar(
    'POST',
    '/pedidos',
    {
      ...datos(),
      productos: []
    }
  );

  assert.equal(sinProductos.status, 400);

  const sinDireccion = await solicitar(
    'POST',
    '/pedidos',
    {
      ...datos(),
      direccionEnvio: ''
    }
  );

  assert.equal(sinDireccion.status, 400);

  const cantidadInvalida = await solicitar(
    'POST',
    '/pedidos',
    {
      ...datos(),
      productos: [
        {
          nombre: 'Producto',
          cantidad: 0,
          precio: 1000
        }
      ]
    }
  );

  assert.equal(cantidadInvalida.status, 400);

  const inexistente = await solicitar(
    'GET',
    '/pedidos/inexistente'
  );

  assert.equal(inexistente.status, 404);

  const ordenInvalido = await solicitar(
    'GET',
    '/pedidos?orden=mal'
  );

  assert.equal(ordenInvalido.status, 400);
});
