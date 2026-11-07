
const local = new Map();

let tabla;

function clienteDb() {
  if (!process.env.TABLE_NAME) {
    return null;
  }

  if (!tabla) {
    const {
      DynamoDBClient
    } = require('@aws-sdk/client-dynamodb');

    const {
      DynamoDBDocumentClient
    } = require('@aws-sdk/lib-dynamodb');

    const client = DynamoDBDocumentClient.from(
      new DynamoDBClient({})
    );

    tabla = {
      client,
      name: process.env.TABLE_NAME
    };
  }

  return tabla;
}

async function guardar(pedido) {
  const db = clienteDb();

  if (!db) {
    local.set(pedido.id, structuredClone(pedido));
    return pedido;
  }

  const { PutCommand } = require(
    '@aws-sdk/lib-dynamodb'
  );

  await db.client.send(
    new PutCommand({
      TableName: db.name,
      Item: pedido
    })
  );

  return pedido;
}

async function obtener(id) {
  const db = clienteDb();

  if (!db) {
    return structuredClone(local.get(id) || null);
  }

  const { GetCommand } = require(
    '@aws-sdk/lib-dynamodb'
  );

  const resultado = await db.client.send(
    new GetCommand({
      TableName: db.name,
      Key: { id }
    })
  );

  return resultado.Item || null;
}


async function listar() {
  const db = clienteDb();

  if (!db) {
    return [...local.values()]
      .map(pedido => structuredClone(pedido));
  }

  const { ScanCommand } = require(
    '@aws-sdk/lib-dynamodb'
  );

  const items = [];
  let inicio;

  do {
    const resultado = await db.client.send(
      new ScanCommand({
        TableName: db.name,
        ExclusiveStartKey: inicio
      })
    );

    items.push(...(resultado.Items || []));
    inicio = resultado.LastEvaluatedKey;

  } while (inicio);

  return items.filter(
    item => !String(item.id).startsWith('PRODUCTO#')
  );
}


async function cambiarEstado(
  id,
  estadoEsperado,
  nuevoEstado
) {
  const db = clienteDb();

  if (!db) {
    const pedido = local.get(id);

    if (!pedido || pedido.estado !== estadoEsperado) {
      return false;
    }

    local.set(id, {
      ...pedido,
      estado: nuevoEstado
    });

    return true;
  }

  const { UpdateCommand } = require(
    '@aws-sdk/lib-dynamodb'
  );

  try {
    await db.client.send(
      new UpdateCommand({
        TableName: db.name,
        Key: { id },
        UpdateExpression: 'SET #estado = :nuevo',
        ConditionExpression: '#estado = :anterior',
        ExpressionAttributeNames: {
          '#estado': 'estado'
        },
        ExpressionAttributeValues: {
          ':nuevo': nuevoEstado,
          ':anterior': estadoEsperado
        }
      })
    );

    return true;

  } catch (error) {
    if (
      error.name === 'ConditionalCheckFailedException'
    ) {
      return false;
    }

    throw error;
  }
}

function limpiarLocal() {
  local.clear();
}

module.exports = {
  guardar,
  obtener,
  listar,
  cambiarEstado,
  limpiarLocal
};
