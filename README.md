# Plataforma de Gestión de Pedidos

## Actividad 6 – Implementación de una Plataforma de Gestión de Pedidos con DevOps en AWS

### Descripción del proyecto

Plataforma web de gestión de pedidos desarrollada con **JavaScript, Node.js y Express.js**, que permite administrar un catálogo de productos, realizar pedidos y hacer seguimiento a su estado mediante una API RESTful.

El proyecto integra un frontend desarrollado con HTML, CSS y JavaScript, que proporciona una interfaz visual, intuitiva y adaptable a diferentes dispositivos.

Adicionalmente, incorpora pruebas automatizadas y una estructura preparada para implementar prácticas de integración continua y despliegue en la nube mediante GitHub Actions y servicios de Amazon Web Services (AWS).

## 1. Objetivo general

Desarrollar una plataforma de gestión de pedidos mediante una API RESTful, incorporando control de versiones, pruebas automatizadas y herramientas DevOps que faciliten la integración y el despliegue de la aplicación en AWS.

## 2. Funcionalidades de la plataforma

### 2.1. Gestión de productos

- Visualizar el catálogo de productos disponibles.
- Registrar nuevos productos.
- Ingresar nombre, descripción, categoría y precio.
- Incorporar imágenes mediante URL o utilizar emojis.
- Eliminar productos del catálogo.
- Filtrar productos por categoría.

**Categorías disponibles:**

- Entradas.
- Plato fuerte.
- Bebidas.
- Postres.
- Otros.

### 2.2. Carrito de compras

- Seleccionar productos del catálogo.
- Agregar productos al carrito.
- Aumentar o disminuir cantidades.
- Eliminar productos del carrito.
- Calcular automáticamente el valor total del pedido.
- Confirmar pedidos mediante un formulario.

### 2.3. Gestión de pedidos

- Crear nuevos pedidos.
- Registrar información del cliente.
- Registrar número de contacto.
- Registrar dirección de envío.
- Almacenar productos, cantidades y precios.
- Generar un identificador único para cada pedido.
- Consultar todos los pedidos registrados.
- Consultar pedidos mediante su identificador.
- Buscar pedidos por identificador, cliente o teléfono desde el panel administrativo.
- Filtrar pedidos por estado.
- Ordenar pedidos por fecha de creación.
- Actualizar el estado de los pedidos.

### 2.4. Estados de los pedidos

La plataforma contempla cuatro estados principales:

1. **Pendiente:** el pedido fue registrado correctamente.
2. **En Proceso:** el pedido se encuentra en preparación.
3. **Enviado:** el pedido fue despachado.
4. **Entregado:** el pedido fue entregado al cliente.

Los cambios de estado se realizan de forma secuencial para mantener un seguimiento ordenado de cada pedido.

### 2.5. Panel administrativo

La plataforma incorpora un apartado de administración que permite:

- Visualizar los pedidos registrados.
- Consultar información del cliente.
- Revisar productos y cantidades solicitadas.
- Consultar el valor total de cada pedido.
- Identificar el estado actual.
- Buscar y filtrar pedidos.
- Ordenar los registros.
- Consultar el resumen de pedidos por estado.
- Actualizar el estado de los pedidos.

## 3. Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| HTML5 | Estructura del frontend |
| CSS3 | Diseño visual y adaptación a dispositivos |
| JavaScript | Interactividad y lógica de la aplicación |
| Node.js | Entorno de ejecución del backend |
| Express.js | Desarrollo de la API RESTful |
| Git | Control de versiones |
| GitHub | Repositorio del código fuente |
| GitHub Actions | Integración continua y ejecución automatizada de pruebas |
| AWS Lambda | Ejecución del backend en la nube |
| Amazon API Gateway | Exposición de los endpoints REST |
| Amazon DynamoDB | Almacenamiento persistente de datos en AWS |
| AWS SAM / CloudFormation | Definición de infraestructura como código |

## 4. Arquitectura del proyecto

La plataforma está organizada en dos componentes principales:

**Frontend:** interfaz web donde los usuarios consultan productos, gestionan el carrito, crean pedidos y acceden al panel de administración.

**Backend:** API RESTful responsable de procesar las solicitudes, validar la información, administrar los productos y gestionar el estado de los pedidos.

La comunicación se realiza mediante solicitudes HTTP y respuestas en formato JSON.

## 5. Estructura del proyecto

```text
plataforma-gestion-pedidos/
│
├── backend/
│   ├── pedidos/
│   │   ├── pedidos.js
│   │   └── api.js
│   │
│   ├── productos/
│   │   ├── catalogo.js
│   │   └── api.js
│   │
│   ├── tests/
│   │   ├── pedidos.test.js
│   │   └── frontend.test.js
│   │
│   ├── app.js
│   ├── server.js
│   ├── storage.js
│   ├── lambda.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── infraestructura/
│   └── template.yaml
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── .gitignore
└── README.md
```

## 6. Instalación del proyecto

### Requisitos previos

- Node.js instalado.
- npm.
- Visual Studio Code o un editor de código.
- Git para el control de versiones.

### Instalación de dependencias

Desde la carpeta principal del proyecto:

```bash
cd backend
npm install
```

## 7. Ejecutar la aplicación

Para iniciar el servidor:

```bash
npm start
```

El servidor estará disponible en:

http://localhost:3000

### Acceso al frontend

http://localhost:3000/tienda/

### Verificación del servidor

http://localhost:3000/health

La respuesta esperada es:

```json
{
  "estado": "ok"
}
```

## 8. Endpoints de la API RESTful

### Gestión de pedidos

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/pedidos` | Crear un pedido |
| GET | `/pedidos` | Listar todos los pedidos |
| GET | `/pedidos/:id` | Consultar un pedido |
| GET | `/pedidos?estado=Pendiente` | Filtrar por estado |
| GET | `/pedidos?orden=asc` | Ordenar por fecha ascendente |
| GET | `/pedidos?orden=desc` | Ordenar por fecha descendente |
| PATCH | `/pedidos/:id/estado` | Actualizar el estado |

### Gestión de productos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/productos` | Consultar catálogo |
| POST | `/productos` | Crear producto |
| DELETE | `/productos/:id` | Eliminar producto |

### Verificación de funcionamiento

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/health` | Consultar estado de la API |

## 9. Ejemplos de solicitudes

### Crear un pedido

**POST /pedidos**

```json
{
  "cliente": {
    "nombre": "Cliente de prueba",
    "telefono": "3001234567"
  },
  "direccionEnvio": "Calle 10 # 5-20",
  "productos": [
    {
      "nombre": "Hamburguesa especial",
      "cantidad": 2,
      "precio": 23900
    },
    {
      "nombre": "Gaseosa",
      "cantidad": 1,
      "precio": 5900
    }
  ]
}
```

El sistema calcula el total y asigna automáticamente el estado inicial **Pendiente**.

### Crear un producto

**POST /productos**

```json
{
  "nombre": "Hamburguesa artesanal",
  "descripcion": "Hamburguesa con carne, queso y vegetales",
  "precio": 25000,
  "categoria": "Plato fuerte",
  "imagenUrl": "",
  "emoji": ""
}
```

### Actualizar el estado de un pedido

**PATCH /pedidos/:id/estado**

```json
{
  "estado": "En Proceso"
}
```

## 10. Pruebas automatizadas

El proyecto incorpora pruebas automatizadas utilizando el módulo de pruebas de Node.js.

Estas verifican:

- Funcionamiento del endpoint de salud.
- Creación y consulta de pedidos.
- Filtrado y ordenamiento.
- Transiciones entre estados.
- Validación de datos incorrectos.
- Publicación del frontend.
- Creación y eliminación de productos.
- Validación de categorías permitidas.

### Ejecutar las pruebas

Desde la carpeta `backend`:

```bash
npm test
```

**Último resultado verificado localmente:**

- Pruebas ejecutadas: 7.
- Pruebas aprobadas: 7.
- Pruebas fallidas: 0.

## 11. Control de versiones e integración continua

El proyecto contempla el uso de Git y GitHub para administrar el código fuente, registrar cambios y mantener el historial de versiones.

La configuración de GitHub Actions se encuentra en:

```text
.github/workflows/ci.yml
```

El flujo está diseñado para:

1. Detectar cambios enviados al repositorio.
2. Preparar el entorno Node.js.
3. Instalar dependencias.
4. Ejecutar las pruebas automatizadas.
5. Generar un artefacto de despliegue.

La ejecución del flujo en GitHub debe verificarse después de publicar el repositorio.

## 12. Infraestructura y despliegue en AWS

La arquitectura propuesta contempla:

**AWS Lambda:** ejecución de la API RESTful.

**Amazon API Gateway:** acceso a los servicios mediante HTTP.

**Amazon DynamoDB:** almacenamiento persistente de pedidos y productos.

**AWS SAM / CloudFormation:** definición de la infraestructura mediante archivos de configuración.

La configuración de infraestructura está ubicada en:

```text
infraestructura/template.yaml
```

El despliegue depende de los permisos disponibles en el entorno AWS y de la configuración de autenticación correspondiente.

## 13. Consideraciones de funcionamiento

En el entorno local, los datos se almacenan temporalmente en memoria y se reinician cuando se detiene el servidor.

La implementación preparada para AWS utiliza DynamoDB para persistir los registros.

La administración de productos y los cambios de estado todavía requieren incorporar controles de autenticación antes de habilitar el sistema para uso público.

El frontend se encuentra separado del backend, por lo que su publicación independiente en AWS requiere una configuración adicional.

## 14. Estado de desarrollo

**Funcionalidades implementadas:**

- API RESTful de gestión de pedidos.
- Catálogo de productos.
- Creación y eliminación de productos.
- Frontend de pedidos.
- Carrito de compras.
- Gestión y seguimiento de estados.
- Panel administrativo.
- Filtros y búsqueda.
- Pruebas automatizadas.

**Etapas pendientes de verificación o implementación:**

- Publicación del repositorio en GitHub.
- Ejecución del pipeline de integración continua.
- Configuración y despliegue en AWS.
- Verificación de la automatización del despliegue.
- Elaboración de evidencias y demostración final.

## 15. Conclusión

La Plataforma de Gestión de Pedidos integra una API RESTful con una interfaz web que facilita el registro, consulta y seguimiento de pedidos.

Su organización modular permite separar la presentación, la lógica de negocio y el almacenamiento, facilitando las pruebas y el mantenimiento del código.

La incorporación de control de versiones, pruebas automatizadas e infraestructura como código constituye la base para implementar un flujo DevOps orientado a mejorar la calidad, trazabilidad y despliegue de la aplicación.
