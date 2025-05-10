# WouK CRM - Sistema de Gestión para Panaderías

![Banner WouK CRM](https://via.placeholder.com/800x200/4D7090/ffffff?text=WouK+CRM)

## Descripción

WouK CRM es un sistema de gestión completo diseñado específicamente para panaderías y negocios similares. Permite administrar clientes, productos, pedidos, inventario y facturación desde una interfaz intuitiva y moderna.

## Características Principales

### Gestión de Clientes
- ✅ Base de datos detallada de clientes
- ✅ Historial de compras por cliente
- ✅ Información de contacto y preferencias
- ✅ Búsqueda rápida y filtrado avanzado

### Gestión de Productos
- ✅ Catálogo completo con precios y disponibilidad
- ✅ Categorización de productos (panes, pasteles, etc.)
- ✅ Gestión de ingredientes y recetas
- ✅ Imágenes y descripciones detalladas

### Gestión de Pedidos
- ✅ Sistema Kanban para seguimiento visual de estados
- ✅ Vista de listado con ordenación inteligente (pendientes primero)
- ✅ Vista de tarjetas para visualización rápida
- ✅ Asociación de facturas a pedidos
- ✅ Fechas de entrega y seguimiento de compromisos
- ✅ Drag & Drop para mover pedidos entre estados

### Facturación
- ✅ Creación y gestión de facturas
- ✅ Asociación con pedidos existentes
- ✅ Actualización automática de estados entre documentos relacionados
- ✅ Integración con AFIP (en desarrollo)
- ✅ Histórico de transacciones

### Inventario
- ✅ Control de stock de productos e ingredientes
- ✅ Alertas de niveles bajos 
- ✅ Historial de movimientos

### Dashboard
- ✅ Visualización rápida de estadísticas clave
- ✅ Contadores en tiempo real
- ✅ Acceso directo a todas las funcionalidades del sistema

## Capturas de Pantalla

### Dashboard Principal
![Dashboard](https://via.placeholder.com/800x400/4D7090/ffffff?text=Dashboard)

### Vista Kanban de Pedidos
![Kanban](https://via.placeholder.com/800x400/6A803D/ffffff?text=Vista+Kanban)

### Gestión de Clientes
![Clientes](https://via.placeholder.com/800x400/C64639/ffffff?text=Gestion+de+Clientes)

## Tecnologías Utilizadas

### Backend
- **Node.js/Express**: Framework para API RESTful
- **MongoDB**: Base de datos NoSQL para almacenamiento de datos
- **Mongoose**: ORM para MongoDB
- **JWT**: Autenticación basada en tokens

### Frontend
- **React**: Biblioteca para interfaces de usuario
- **Bootstrap 5**: Framework CSS para diseño responsive
- **React-Beautiful-DnD**: Para funcionalidad de arrastrar y soltar en Kanban
- **React-Toastify**: Para notificaciones al usuario
- **React Router**: Navegación entre páginas
- **Axios**: Cliente HTTP para peticiones API

## Instalación y Configuración

### Prerrequisitos
- Node.js (v14 o superior)
- MongoDB (v4 o superior)
- npm o yarn

### Pasos de Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/jeanguarenas/bakerycrm.git
cd bakerycrm
```

2. Instalar dependencias para el backend
```bash
npm install
```

3. Instalar dependencias para el frontend
```bash
cd client
npm install
cd ..
```

4. Configurar variables de entorno
   - Crear un archivo `.env` en la raíz del proyecto
   - Añadir las siguientes variables:
```
MONGODB_URI=mongodb://localhost:27017/bakerycrm
PORT=5000
JWT_SECRET=tu_secreto_jwt
NODE_ENV=development
```

5. Iniciar el servidor en modo desarrollo
```bash
npm run dev
```

6. Abrir el navegador en `http://localhost:3000`

## Estructura del Proyecto

```
bakerycrm/
├── client/                 # Frontend React
│   ├── public/             # Archivos estáticos
│   └── src/                # Código fuente React
│       ├── components/     # Componentes reutilizables
│       │   ├── facturacion/  # Componentes de facturación
│       │   └── inventario/   # Componentes de inventario 
│       ├── pages/          # Páginas principales
│       └── styles/         # Estilos CSS
├── models/                 # Modelos de datos MongoDB
│   ├── Customer.js         # Modelo de clientes
│   ├── Invoice.js          # Modelo de facturas
│   ├── Order.js            # Modelo de pedidos
│   └── Product.js          # Modelo de productos
├── routes/                 # Rutas de la API
│   └── api.js              # Endpoints de la API
├── middleware/             # Middleware personalizado
│   └── auth.js             # Middleware de autenticación
└── server.js              # Punto de entrada del servidor
```

## Guía para Desarrolladores

### Convenciones de Código
- Utilizamos ESLint con la configuración de Airbnb
- Commits en formato convencional (feat:, fix:, docs:, etc.)
- Ramas de características con el formato `feature/nombre-caracteristica`

### Proceso de Pull Request
1. Crear una rama desde `develop`
2. Implementar los cambios y pruebas
3. Asegurar que todos los tests pasen
4. Crear un Pull Request hacia `develop`
5. Esperar revisión y aprobación

### API Reference

La documentación de la API está disponible en `/api/docs` cuando el servidor está en ejecución.

## Roadmap - Funcionalidades en Desarrollo

### Próximas Características (Q2 2025)
- 🔄 Panel de análisis avanzado con métricas de ventas
- 🔄 Sistema de gestión de recetas con cálculo de costos
- 🔄 Integración completa con AFIP para facturación electrónica

### Características Futuras (Q3-Q4 2025)
- 🔄 Aplicación móvil para gestión en movimiento
- 🔄 Sistema de fidelización de clientes con puntos y recompensas
- 🔄 Portal de cliente para autoservicio
- 🔄 Optimización de rutas de entrega con mapas
- 🔄 Sistema de previsión de demanda basado en históricos

## Contribuciones

Las contribuciones son bienvenidas. Por favor, siga estos pasos:

1. Fork del repositorio
2. Crear una rama para su característica (`git checkout -b feature/amazing-feature`)
3. Comitear los cambios (`git commit -m 'feat: add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir un Pull Request

## Resolución de Problemas

### Problemas Comunes

**Error de conexión a MongoDB**
- Verificar que MongoDB esté ejecutándose con `mongo --version`
- Comprobar que la URL en .env sea correcta

**El frontend no se conecta con el backend**
- Verificar que el proxy en `client/package.json` apunte al puerto correcto

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulte el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Jean Guarenas - [GitHub](https://github.com/jeanguarenas) - [LinkedIn](https://linkedin.com/in/jeanguarenas)

Enlace del proyecto: [https://github.com/jeanguarenas/bakerycrm](https://github.com/jeanguarenas/bakerycrm)
