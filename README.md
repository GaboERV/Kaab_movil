# Kaab - Aplicación Móvil para Monitoreo de Colmenas

## 📱 Descripción

Kaab es una aplicación móvil desarrollada con React Native y Expo para el monitoreo y gestión de colmenas inteligentes. Permite visualizar datos en tiempo real de sensores, recibir alertas automáticas y gestionar la configuración de múltiples colmenas desde un dispositivo móvil.

> **Nota:** Actualmente la aplicación está en fase de desarrollo y aún no se ha considerado su despliegue a producción.

## ✨ Características Principales

- 🔐 **Autenticación segura** con tokens JWT
- 📊 **Dashboard** con datos generales de todas las colmenas
- 📈 **Gráficas históricas** con diferentes rangos temporales
- 🚨 **Notificaciones en tiempo real** vía WebSocket
- ⚙️ **Configuración personalizable** de parámetros de alerta
- 💾 **Almacenamiento local** con SQLite para notificaciones
- 🌐 **Sincronización** automática con servidor backend

## 🛠️ Tecnologías Utilizadas

- **React Native** con Expo
- **TypeScript** para tipado estático
- **Expo Router** para navegación
- **WebSocket** para comunicación en tiempo real
- **SQLite** para almacenamiento local
- **SecureStore** para manejo seguro de tokens
- **react-native-chart-kit** para visualización de datos

## 📋 Requisitos del Sistema

### Dispositivo Móvil
- **Android:** Versión 6.0 (API nivel 23) o superior
- **iOS:** Versión 11.0 o superior
- **Conexión a Internet:** Requerida para sincronización
- **Espacio:** Mínimo 100 MB disponibles

### Desarrollo
- **Node.js:** Versión LTS (18.x o superior)
- **npm/Yarn:** Gestor de paquetes
- **Expo CLI:** Herramientas de desarrollo
- **Expo Go:** App para testing en dispositivo

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone git clone https://github.com/GaboERV/Kaab_movil.git
cd kaab-mobile-app
```

### 2. Instalar Dependencias
```bash
npm install
# o
yarn install
```

### 3. Configurar Backend
Edita el archivo `ApiBackend.ts` con la IP de tu servidor:
```typescript
export const ApiBackend = 'TU_IP_DEL_SERVIDOR';
// Ejemplo: export const ApiBackend = '192.168.1.100';
```

### 4. Instalar Expo CLI (si no está instalado)
```bash
npm install -g @expo/cli
```

### 5. Ejecutar en Modo Desarrollo
```bash
npx expo start
```

### 6. Abrir en Dispositivo
- **Android:** Instala Expo Go y escanea el código QR
- **iOS:** Usa la cámara para escanear el código QR

## 📁 Estructura del Proyecto

```
kaab-mobile-app/
├── app/                         # Rutas principales
│   ├── (drawer)/                # Navegación con drawer
│   │   ├── _layout.tsx          # Layout del drawer
│   │   ├── home.tsx             # Dashboard principal
│   │   ├── notificaciones.tsx   # Gestión de alertas
│   │   └── colmena-detalles/    # Detalles de colmenas
│   │       └── [id].tsx         # Vista dinámica por ID
│   ├── _layout.tsx              # Layout raíz
│   └── index.tsx                # Pantalla de login
├── components/                  # Componentes reutilizables
│   ├── SensorChart.tsx          # Gráficas de sensores
│   ├── SelectTimeComponent.tsx  # Selector temporal
│   └── ...
├── ApiBackend.ts                # Configuración del servidor
├── WebSocketContext.tsx         # Contexto de WebSocket
├── websocketHandler.tsx         # Manejador de eventos
└── README.md                    # Este archivo
```

## 🖥️ Pantallas de la Aplicación

### 🔐 Login (`index.tsx`)
- Autenticación con email/contraseña
- Validación de formularios
- Almacenamiento seguro de tokens
- Navegación automática tras login

### 🏠 Dashboard (`home.tsx`)
- Lista de colmenas registradas
- Datos promediados (temperatura, humedad, presión, peso)
- Búsqueda y filtrado
- Navegación a detalles

### 📊 Detalle de Colmena (`colmena-detalles/[id].tsx`)
- Datos en tiempo real de sensores
- Gráficas históricas interactivas
- Configuración de parámetros
- Activación/desactivación

### 🔔 Notificaciones (`notificaciones.tsx`)
- Listado de alertas recibidas
- Almacenamiento local persistente
- Eliminación de notificaciones
- Actualización en tiempo real

## 🔌 Configuración del Backend

### Endpoints Requeridos
```
POST   /auth/login                    # Autenticación
GET    /configuracion-colmenas        # Lista de colmenas
GET    /configuracion-colmenas/:id    # Detalle de colmena
PATCH  /configuracion-colmenas/:id    # Actualizar configuración
GET    /datos-colmenas/ultimo-dato-colmena     # Datos tiempo real
GET    /datos-colmenas/historico-colmena       # Datos históricos
WebSocket :3001                       # Alertas en tiempo real
```

### Formato de Datos WebSocket
```json
{
    "event": "colmenaAlert",
    "data": {
        "colmena_id": "COLMENA_001",
        "motivos": ["temperatura_alta", "humedad_baja"],
        "temperatura": 35.5,
        "humedad": 45.2,
        "presion": 1013.25,
        "peso": 25.8
    }
}
```

## 🔧 Comandos Útiles

```bash
# Desarrollo
npx expo start                    # Iniciar servidor desarrollo
npx expo start --clear           # Limpiar caché
npx expo start --android         # Abrir en emulador Android
npx expo start --ios             # Abrir en simulador iOS

# Debugging
npx expo logs                     # Ver logs en tiempo real
npx expo doctor                   # Verificar configuración

# Producción
npx expo build:android           # Construir APK
npx expo build:ios               # Construir para iOS
```

## 🐛 Solución de Problemas

### Problemas de Conexión
- ✅ Verificar que el dispositivo esté en la misma red que el servidor
- ✅ Confirmar IP correcta en `ApiBackend.ts`
- ✅ Revisar puertos 3000 (HTTP) y 3001 (WebSocket) abiertos

### Problemas de Notificaciones
- ✅ Verificar permisos de notificaciones en el dispositivo
- ✅ Comprobar inicialización de SQLite en logs
- ✅ Revisar conexión WebSocket


