const API_BASE = "https://w3ubz2867h.execute-api.us-east-1.amazonaws.com";
const $ = selector => document.querySelector(selector);

const pesos = valor =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(valor);

const safe = valor =>
  String(valor ?? '').replace(/[&<>"']/g, caracter => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[caracter]));

let productos = [];
let categoria = 'Todos';
let pedidos = [];

const carrito = new Map();


async function api(url, opciones = {}) {
  const respuesta = await fetch(API_BASE + url, opciones);

  let datos;

  try {
    datos = await respuesta.json();
  } catch {
    throw new Error('Respuesta no válida del servidor');
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.error || `Error HTTP ${respuesta.status}`
    );
  }

  return datos;
}


function jsonOptions(method, data) {
  return {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
}

// CATALOGO DE PRODUCTOS

async function cargarProductos() {
  try {
    productos = await api('/productos');
    pintarCategorias();
    pintarProductos();
    pintarCarrito();
  } catch (error) {
    $('#catalogo').textContent = error.message;
  }
}

function pintarCategorias() {
  const categorias = [
    'Todos',
    'Entradas',
    'Plato fuerte',
    'Bebidas',
    'Postres',
    'Otros'
  ];

  $('#categorias').innerHTML = categorias.map(c => `
    <button
      class="filter ${categoria === c ? 'active' : ''}"
      data-cat="${safe(c)}"
    >
      ${safe(c)}
    </button>
  `).join('');
}

function visual(producto) {
  if (producto.imagenUrl) {
    return `
      <img
        src="${safe(producto.imagenUrl)}"
        alt="${safe(producto.nombre)}"
        loading="lazy"
      >
    `;
  }

  if (producto.emoji) {
    return `<span>${safe(producto.emoji)}</span>`;
  }

  return '<span>▣</span>';
}

function pintarProductos() {
  const datos = categoria === 'Todos'
    ? productos
    : productos.filter(p => p.categoria === categoria);

  if (!datos.length) {
    $('#catalogo').innerHTML =
      '<p>No hay productos en esta categoría.</p>';
    return;
  }

  $('#catalogo').innerHTML = datos.map(p => `
    <article class="card">
      <div class="visual">
        ${visual(p)}
      </div>

      <div class="details">
        <h3>${safe(p.nombre)}</h3>
        <p>${safe(p.descripcion)}</p>

        <div class="priceRow">
          <strong>${pesos(p.precio)}</strong>

          <div class="actions">
            <button data-add="${safe(p.id)}">
              + Agregar
            </button>

            <button
              class="delete"
              data-delete="${safe(p.id)}"
              title="Eliminar producto"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

$('#categorias').addEventListener('click', event => {
  const boton = event.target.closest('[data-cat]');

  if (!boton) return;

  categoria = boton.dataset.cat;

  pintarCategorias();
  pintarProductos();
});

$('#catalogo').addEventListener('click', async event => {
  const agregar = event.target.closest('[data-add]');
  const eliminar = event.target.closest('[data-delete]');

  if (agregar) {
    cambiarCantidad(agregar.dataset.add, 1);
    abrirCarrito();
  }

  if (eliminar) {
    const producto = productos.find(
      p => p.id === eliminar.dataset.delete
    );

    if (!producto) return;

    const confirmar = confirm(
      `¿Eliminar "${producto.nombre}" del menú? ` +
      'Los pedidos anteriores se conservarán.'
    );

    if (!confirmar) return;

    try {
      await api(
        '/productos/' + encodeURIComponent(producto.id),
        { method: 'DELETE' }
      );

      carrito.delete(producto.id);
      await cargarProductos();

    } catch (error) {
      alert(error.message);
    }
  }
});

// CARRITO

function cambiarCantidad(id, diferencia) {
  const cantidad = (carrito.get(id) || 0) + diferencia;

  if (cantidad <= 0) {
    carrito.delete(id);
  } else {
    carrito.set(id, cantidad);
  }

  pintarCarrito();
}

function pintarCarrito() {
  const items = [...carrito].map(([id, cantidad]) => ({
    producto: productos.find(p => p.id === id),
    cantidad
  })).filter(item => item.producto);

  const cantidadTotal = items.reduce(
    (suma, item) => suma + item.cantidad,
    0
  );

  const total = items.reduce(
    (suma, item) =>
      suma + item.producto.precio * item.cantidad,
    0
  );

  $('#contador').textContent = cantidadTotal;
  $('#total').textContent = pesos(total);

  $('#items').innerHTML = items.length
    ? items.map(({ producto, cantidad }) => `
      <div class="item">
        <div>
          <strong>${safe(producto.nombre)}</strong>
          <small>
            ${pesos(producto.precio * cantidad)}
          </small>
        </div>

        <div class="qty">
          <button
            data-id="${safe(producto.id)}"
            data-delta="-1"
          >−</button>

          ${cantidad}

          <button
            data-id="${safe(producto.id)}"
            data-delta="1"
          >+</button>
        </div>
      </div>
    `).join('')
    : 'Tu carrito está vacío.';
}

$('#items').addEventListener('click', event => {
  const boton = event.target.closest('[data-delta]');

  if (boton) {
    cambiarCantidad(
      boton.dataset.id,
      Number(boton.dataset.delta)
    );
  }
});

function abrirCarrito() {
  $('#carrito').classList.add('open');
  $('#oscurecer').hidden = false;
}

function cerrarCarrito() {
  $('#carrito').classList.remove('open');
  $('#oscurecer').hidden = true;
}

$('#abrirCarrito').addEventListener('click', abrirCarrito);
$('#cerrarCarrito').addEventListener('click', cerrarCarrito);
$('#oscurecer').addEventListener('click', cerrarCarrito);

// ADMINISTRAR PRODUCTOS

$('#tipoVisual').addEventListener('change', event => {
  $('#filaImagen').hidden =
    event.target.value !== 'imagen';

  $('#filaEmoji').hidden =
    event.target.value !== 'emoji';
});

$('#abrirProductos').addEventListener('click', () => {
  $('#modalProducto').showModal();
});

$('#cerrarProducto').addEventListener('click', () => {
  $('#modalProducto').close();
});

$('#formProducto').addEventListener('submit', async event => {
  event.preventDefault();

  const formulario = event.currentTarget;
  const datos = Object.fromEntries(
    new FormData(formulario)
  );

  const tipo = $('#tipoVisual').value;

  const producto = {
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    precio: Number(datos.precio),
    categoria: datos.categoria,
    imagenUrl: tipo === 'imagen'
      ? datos.imagenUrl
      : '',
    emoji: tipo === 'emoji'
      ? datos.emoji
      : ''
  };

  try {
    await api(
      '/productos',
      jsonOptions('POST', producto)
    );

    formulario.reset();

    $('#tipoVisual').dispatchEvent(
      new Event('change')
    );

    $('#mensajeProducto').textContent = '';
    $('#modalProducto').close();

    categoria = 'Todos';
    await cargarProductos();

  } catch (error) {
    $('#mensajeProducto').textContent = error.message;
  }
});

// REGISTRAR PEDIDOS

$('#formPedido').addEventListener('submit', async event => {
  event.preventDefault();

  const items = [...carrito].map(([id, cantidad]) => ({
    producto: productos.find(p => p.id === id),
    cantidad
  })).filter(item => item.producto);

  if (!items.length) {
    $('#mensajePedido').textContent =
      'Agrega productos al carrito.';
    return;
  }

  const formulario = event.currentTarget;
  const datos = Object.fromEntries(
    new FormData(formulario)
  );

  const pedido = {
    cliente: {
      nombre: datos.nombre,
      telefono: datos.telefono
    },
    direccionEnvio: datos.direccion,
    productos: items.map(({ producto, cantidad }) => ({
      nombre: producto.nombre,
      cantidad,
      precio: producto.precio
    }))
  };

  try {
    const respuesta = await api(
      '/pedidos',
      jsonOptions('POST', pedido)
    );

    $('#mensajePedido').textContent =
      `Pedido creado. ID: ${respuesta.id}. ` +
      `Estado: ${respuesta.estado}. ` +
      `Total: ${pesos(respuesta.total)}`;

    carrito.clear();
    pintarCarrito();
    formulario.reset();

  } catch (error) {
    $('#mensajePedido').textContent = error.message;
  }
});

// PANEL ADMINISTRATIVO

const estados = [
  'Pendiente',
  'En Proceso',
  'Enviado',
  'Entregado'
];

async function cargarPedidos() {
  try {
    const orden = $('#ordenPedidos').value;

    pedidos = await api('/pedidos?orden=' + orden);

    pintarPedidos();

    $('#mensajeAdmin').textContent = '';

  } catch (error) {
    $('#mensajeAdmin').textContent = error.message;
  }
}

function pintarPedidos() {
  const buscar = $('#buscarPedido').value
    .toLowerCase()
    .trim();

  const estado = $('#filtroEstado').value;

  const lista = pedidos.filter(pedido => {
    const coincideEstado =
      !estado || pedido.estado === estado;

    const texto = [
      pedido.id,
      pedido.cliente?.nombre || '',
      pedido.cliente?.telefono || ''
    ].join(' ').toLowerCase();

    return coincideEstado &&
      (!buscar || texto.includes(buscar));
  });

  // Resumen por estado
  $('#resumenPedidos').innerHTML = `
    <div class="counter">
      Total: <b>${pedidos.length}</b>
    </div>
  ` + estados.map(estado => `
    <div class="counter">
      ${estado}:
      <b>${pedidos.filter(p => p.estado === estado).length}</b>
    </div>
  `).join('');

  if (!lista.length) {
    $('#listaPedidos').innerHTML =
      '<p>No hay pedidos con esos filtros.</p>';
    return;
  }

  $('#listaPedidos').innerHTML = lista.map(pedido => {
    const posicion = estados.indexOf(pedido.estado);
    const siguiente = estados[posicion + 1];

    const fecha = new Date(
      pedido.fechaCreacion
    ).toLocaleString('es-CO');

    const productosTexto = (pedido.productos || [])
      .map(p => `${p.cantidad} × ${p.nombre}`)
      .join(', ');

    return `
      <article class="order">

        <div class="orderhead">
          <b>
            Pedido ${safe(pedido.id.slice(0, 8))}
          </b>

          <span class="status">
            ${safe(pedido.estado)}
          </span>

          <small>${safe(fecha)}</small>
        </div>

        <p>
          <strong>Cliente:</strong>
          ${safe(pedido.cliente?.nombre)}
          · ${safe(pedido.cliente?.telefono)}
        </p>

        <p>
          <strong>Envío:</strong>
          ${safe(pedido.direccionEnvio)}
        </p>

        <p>
          <strong>Productos:</strong>
          ${safe(productosTexto)}
        </p>

        <p>
          <strong>Total:</strong>
          ${pesos(pedido.total)}
        </p>

        <div class="orderactions">
          <span>
            Estado actual:
            <strong>${safe(pedido.estado)}</strong>
          </span>

          ${siguiente
            ? `
              <button
                data-estado="${safe(pedido.id)}"
              >
                Avanzar a ${safe(siguiente)}
              </button>
            `
            : '<b>✓ Recibido / Entregado</b>'
          }
        </div>

      </article>
    `;
  }).join('');
}

// Abrir panel de pedidos
$('#verPedidos').addEventListener('click', async () => {
  $('#modalPedidos').showModal();
  await cargarPedidos();
});

// Cerrar panel
$('#cerrarPedidos').addEventListener('click', () => {
  $('#modalPedidos').close();
});

// Actualizar listado
$('#recargarPedidos').addEventListener(
  'click',
  cargarPedidos
);

// Buscar y filtrar
$('#buscarPedido').addEventListener(
  'input',
  pintarPedidos
);

$('#filtroEstado').addEventListener(
  'change',
  pintarPedidos
);

$('#ordenPedidos').addEventListener(
  'change',
  cargarPedidos
);

// Cambiar estado del pedido
$('#listaPedidos').addEventListener(
  'click',
  async event => {
    const boton = event.target.closest('[data-estado]');

    if (!boton) return;

    const pedido = pedidos.find(
      p => p.id === boton.dataset.estado
    );

    if (!pedido) return;

    const siguiente = estados[
      estados.indexOf(pedido.estado) + 1
    ];

    if (!siguiente) return;

    const confirmar = confirm(
      `¿Cambiar este pedido de ${pedido.estado} ` +
      `a ${siguiente}?`
    );

    if (!confirmar) return;

    boton.disabled = true;

    try {
      await api(
        '/pedidos/' +
        encodeURIComponent(pedido.id) +
        '/estado',
        jsonOptions('PATCH', {
          estado: siguiente
        })
      );

      await cargarPedidos();

    } catch (error) {
      $('#mensajeAdmin').textContent = error.message;
      boton.disabled = false;
    }
  }
);

// INICIAR APLICACIÓN
cargarProductos();
pintarCarrito();
