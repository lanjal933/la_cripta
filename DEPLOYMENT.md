# Guía de Despliegue - La Cripta

## Resumen de Cambios

He creado un backend completo con Node.js, Express, MongoDB y Socket.IO para que el sistema de matchmaking funcione en un servidor real con múltiples usuarios.

## Archivos Creados

### Backend (carpeta `server/`)
- `package.json` - Dependencias del servidor
- `.env.example` - Template de variables de entorno
- `server.js` - Servidor principal con Express y Socket.IO
- `models/User.js` - Modelo de usuario MongoDB
- `models/MatchmakingSearch.js` - Modelo de búsquedas de matchmaking
- `models/Group.js` - Modelo de grupos formados
- `middleware/auth.js` - Middleware de autenticación JWT
- `routes/auth.js` - Rutas de autenticación
- `routes/users.js` - Rutas de usuarios
- `routes/matchmaking.js` - Rutas de matchmaking
- `README.md` - Documentación del servidor

### Frontend
- `js/api-client.js` - Cliente API para el frontend
- `js/api-config.js` - Configuración de API

### Archivos Actualizados
- `pages/login.html` - Ahora usa la API en lugar de localStorage
- `pages/matchmaking.html` - Ahora usa la API y Socket.IO
- `js/user-menu.js` - Ahora usa la API para todas las operaciones

## Instrucciones de Despliegue

### 1. Instalar MongoDB

**Opción A: Local**
```bash
# Windows: Descargar desde https://www.mongodb.com/try/download/community
# Linux/Mac: Usar brew o apt
```

**Opción B: MongoDB Atlas (Recomendado para producción)**
1. Crear cuenta en https://www.mongodb.com/cloud/atlas
2. Crear un cluster gratuito
3. Obtener la connection string
4. Reemplazar `MONGODB_URI` en `.env`

### 2. Configurar el Servidor

```bash
cd server
npm install
cp .env.example .env
```

Editar `.env`:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/la-cripta
JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro_aqui
NODE_ENV=development
```

**IMPORTANTE:** Cambiar `JWT_SECRET` a un string largo y aleatorio en producción.

### 3. Ejecutar en Desarrollo

```bash
cd server
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### 4. Actualizar URLs del Frontend

En los archivos del frontend, cambiar:
- `pages/login.html`: Línea 237 - `http://localhost:3000/api/auth/me`
- `pages/login.html`: Línea 301 - `http://localhost:3000/api/auth/register`
- `pages/login.html`: Línea 414 - `http://localhost:3000/api/auth/availability`
- `pages/login.html`: Línea 442 - `http://localhost:3000/api/auth/availability`
- `pages/matchmaking.html`: Línea 231 - `http://localhost:3000/api`
- `pages/matchmaking.html`: Línea 232 - `http://localhost:3000`
- `js/user-menu.js`: Línea 3 - `http://localhost:3000/api`

**Para producción:** Reemplazar `http://localhost:3000` con tu URL de servidor real.

### 5. Despliegue en Producción

#### Usando PM2 (Recomendado)

```bash
npm install -g pm2
cd server
pm2 start server.js --name la-cripta
pm2 save
pm2 startup
```

#### Usando Docker (Opcional)

```bash
cd server
docker build -t la-cripta-server .
docker run -p 3000:3000 la-cripta-server
```

### 6. Configurar HTTPS (Producción)

Usar Nginx o Apache como reverse proxy con SSL:
```nginx
server {
    listen 443 ssl;
    server_name tu-dominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro/Login
- `GET /api/auth/me` - Obtener usuario actual
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/availability` - Actualizar disponibilidad
- `PUT /api/auth/settings` - Actualizar configuración
- `POST /api/auth/logout` - Cerrar sesión

### Matchmaking
- `POST /api/matchmaking/search` - Crear búsqueda
- `DELETE /api/matchmaking/search` - Cancelar búsqueda
- `GET /api/matchmaking/my-search` - Obtener mi búsqueda
- `GET /api/matchmaking/active` - Obtener búsquedas activas
- `POST /api/matchmaking/check-matches` - Verificar matches

### Usuarios
- `GET /api/users/notifications` - Obtener notificaciones
- `PUT /api/users/notifications/:id/read` - Marcar como leída
- `DELETE /api/users/notifications/:id` - Eliminar notificación

## Socket.IO Events

### Cliente → Servidor
- `join-matchmaking` - Unirse a matchmaking
- `leave-matchmaking` - Salir de matchmaking

### Servidor → Cliente
- `new-search` - Nueva búsqueda creada
- `search-cancelled` - Búsqueda cancelada
- `group-found` - Grupo encontrado

## Notas Importantes

1. **Seguridad:**
   - Cambiar `JWT_SECRET` en producción
   - Usar HTTPS en producción
   - Configurar CORS correctamente
   - Usar variables de entorno para datos sensibles

2. **Base de Datos:**
   - Usar MongoDB Atlas para producción
   - Configurar backups automáticos
   - Monitorear uso de almacenamiento

3. **Escalabilidad:**
   - Considerar usar Redis para Socket.IO en múltiples servidores
   - Configurar balanceador de carga si es necesario
   - Monitorear rendimiento con herramientas como New Relic o Datadog

4. **Mantenimiento:**
   - Implementar logs estructurados (Winston, Pino)
   - Configurar monitoreo de errores (Sentry)
   - Implementar health checks
   - Configurar limpieza automática de búsquedas expiradas

## Solución de Problemas

### El servidor no inicia
- Verificar que MongoDB esté corriendo
- Verificar que el puerto 3000 esté disponible
- Revisar logs del servidor

### Error de conexión a MongoDB
- Verificar `MONGODB_URI` en `.env`
- Verificar que MongoDB esté accesible
- Revisar credenciales si usando Atlas

### Socket.IO no conecta
- Verificar que el servidor Socket.IO esté corriendo
- Revisar configuración de CORS
- Verificar firewall/proxy

### El frontend no se conecta a la API
- Verificar que el servidor esté corriendo
- Verificar URLs en los archivos del frontend
- Revisar console del navegador para errores
