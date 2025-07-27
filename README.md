# 📱 App Móvil Expo – Monitoreo y Gestión de Colmenas

Aplicación desarrollada con **React Native (Expo)** que permite a los usuarios autenticar, visualizar datos de colmenas en tiempo real, recibir alertas mediante WebSocket nativo y guardar notificaciones localmente usando SQLite. La app se comunica con un backend basado en microservicios.

---

## ⚙️ Requisitos

- **Node.js** ≥ 18
- **Expo CLI**  
    Instala Expo CLI globalmente:
    ```bash
    npm install -g expo-cli
    ```
- **Expo Go** en el teléfono (Android/iOS)
- Acceso a red local o pública al backend (API REST + WebSocket)

---

## 🧪 Instalación y Ejecución

1. **Clona el repositorio**
     ```bash
     git clone https://github.com/GaboERV/Kaab-App.git
     cd Kaab-App
     ```

2. **Instala dependencias**
     ```bash
     npm install
     ```

3. **Configura la URL del backend**

    Edita el archivo `app/apiBackend.ts` y ajusta las URLs de la API y WebSocket según la IP o dominio de tu backend:
    ```ts
    export const API_URL = "<IP_BACKEND>";
    ```

4. **Inicia la app con Expo**
     ```bash
     npx expo start
     ```
     Escanea el QR con Expo Go.

---

## 🛠️ Build de Producción (opcional)

```bash
npx eas build --platform android
```
