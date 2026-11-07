
const test = require('node:test');
const assert = require('node:assert/strict');

const app = require('../app');

async function withServer(fn) {
  const servidor = app.listen(0);

  await new Promise(resolve =>
    servidor.once('listening', resolve)
  );

  try {
    const base =
      'http://127.0.0.1:' + servidor.address().port;

    return await fn(base);
  } finally {
    await new Promise(resolve =>
      servidor.close(resolve)
    );
  }
}

test('frontend separado se publica', () =>
  withServer(async base => {
    const rutas = [
      '/tienda/',
      '/tienda/styles.css',
      '/tienda/app.js'
    ];

    for (const ruta of rutas) {
      const respuesta = await fetch(base + ruta);

      assert.equal(respuesta.status, 200);
    }

    const respuesta = await fetch(base + '/tienda/');
    const html = await respuesta.text();

    assert.match(html, /Gestión de pedidos/i);
  })
);

test('categorías nuevas, alta y eliminación de producto', () =>
  withServer(async base => {
    const datos = {
      nombre: 'Arepa',
      precio: 12500,
      categoria: 'Entradas',
      descripcion: 'Prueba',
      emoji: '',
      imagenUrl: ''
    };

    const respuesta = await fetch(base + '/productos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });

    assert.equal(respuesta.status, 201);

    const producto = await respuesta.json();

    assert.equal(producto.categoria, 'Entradas');

    const listado = await fetch(base + '/productos');
    const productos = await listado.json();

    assert.ok(
      productos.some(p => p.id === producto.id)
    );

    const eliminacion = await fetch(
      base + '/productos/' + encodeURIComponent(producto.id),
      {
        method: 'DELETE'
      }
    );

    assert.equal(eliminacion.status, 200);

    const listadoFinal = await fetch(base + '/productos');
    const productosFinales = await listadoFinal.json();

    assert.ok(
      !productosFinales.some(p => p.id === producto.id)
    );
  })
);

test('rechaza categoría no permitida', () =>
  withServer(async base => {
    const respuesta = await fetch(base + '/productos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: 'Prueba',
        precio: 10,
        categoria: 'Combos'
      })
    });

    assert.equal(respuesta.status, 400);
  })
);
