
const { randomUUID } = require('node:crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand
} = require('@aws-sdk/lib-dynamodb');

const CATEGORIAS = [
  'Entradas',
  'Plato fuerte',
  'Bebidas',
  'Postres',
  'Otros'
];

const iniciales = [
  {
    id: 'PRODUCTO#demo1',
    nombre: 'Papas crocantes',
    descripcion: 'Papas con salsa de la casa',
    precio: 9900,
    categoria: 'Entradas',
    imagenUrl: '',
    emoji: '🍟'
  },
  {
    id: 'PRODUCTO#demo2',
    nombre: 'Hamburguesa especial',
    descripcion: 'Carne, queso y vegetales',
    precio: 23900,
    categoria: 'Plato fuerte',
    imagenUrl: '',
    emoji: '🍔'
  },
  {
    id: 'PRODUCTO#demo3',
    nombre: 'Pollo crujiente',
    descripcion: 'Pollo, papas y ensalada',
    precio: 28900,
    categoria: 'Plato fuerte',
    imagenUrl: '',
    emoji: '🍗'
  },
  {
    id: 'PRODUCTO#demo4',
    nombre: 'Gaseosa fría',
    descripcion: 'Bebida de 400 ml',
    precio: 5900,
    categoria: 'Bebidas',
    imagenUrl: '',
    emoji: '🥤'
  },
  {
    id: 'PRODUCTO#demo5',
    nombre: 'Helado de vainilla',
    descripcion: 'Helado con cobertura',
    precio: 7900,
    categoria: 'Postres',
    imagenUrl: '',
    emoji: '🍦'
  }
];

const productosLocales = new Map(
  iniciales.map(p => [p.id, p])
);

let db;

function cliente() {
  if (!db) {
    db = DynamoDBDocumentClient.from(
      new DynamoDBClient({})
    );
  }
  return db;
}

async function listarProductos() {
  if (!process.env.TABLE_NAME) {
    return [...productosLocales.values()];
  }

  const todos = new Map(
    iniciales.map(p => [p.id, p])
  );

  let cursor;

  do {
    const resultado = await cliente().send(
      new ScanCommand({
        TableName: process.env.TABLE_NAME,
        FilterExpression: 'begins_with(#id, :p)',
        ExpressionAttributeNames: {
          '#id': 'id'
        },
        ExpressionAttributeValues: {
          ':p': 'PRODUCTO#'
        },
        ExclusiveStartKey: cursor
      })
    );

    for (const producto of resultado.Items || []) {
      if (producto.eliminado) {
        todos.delete(producto.id);
      } else {
        todos.set(producto.id, producto);
      }
    }

    cursor = resultado.LastEvaluatedKey;
  } while (cursor);

  return [...todos.values()];
}

async function crearProducto(datos) {
  const producto = {
    id: 'PRODUCTO#' + randomUUID(),
    nombre: datos.nombre,
    descripcion: datos.descripcion || '',
    precio: datos.precio,
    categoria: datos.categoria,
    imagenUrl: datos.imagenUrl || '',
    emoji: datos.emoji || ''
  };

  if (!process.env.TABLE_NAME) {
    productosLocales.set(producto.id, producto);
  } else {
    await cliente().send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: producto
      })
    );
  }

  return producto;
}

async function eliminarProducto(id) {
  if (!id.startsWith('PRODUCTO#')) {
    return false;
  }

  const actuales = await listarProductos();

  if (!actuales.some(p => p.id === id)) {
    return false;
  }

  if (!process.env.TABLE_NAME) {
    productosLocales.delete(id);
    return true;
  }

  // Evita que los productos iniciales reaparezcan.
  await cliente().send(
    new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        id,
        eliminado: true
      }
    })
  );

  return true;
}

module.exports = {
  CATEGORIAS,
  listarProductos,
  crearProducto,
  eliminarProducto
};
