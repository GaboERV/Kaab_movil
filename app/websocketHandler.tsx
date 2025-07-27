// websocketHandler.ts
import type * as SQLite from "expo-sqlite"
import * as Notifications from "expo-notifications"
import { useEffect, useState } from "react"

interface AlertaData {
  colmena_id: string
  timestamp: number
  temperatura: number
  humedad: number
  presion: number
  peso: number
  motivos: string[]
}

function generarID() {
  return Math.random().toString(36).substring(2, 12) + Date.now().toString()
}

const createWebSocketHandler = (dbReady: boolean, db: SQLite.SQLiteDatabase | null, websocketURL: string) => {
  return () => { // Return a function that manages the socket and reconnection
    let socket: WebSocket | null = null;
    let reconnectInterval: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      if (!dbReady || !db) {
        console.error("Database is not ready, will not setup")
        return
      }

      socket = new WebSocket(websocketURL); // Use the provided websocketURL

      const handleColmenaAlert = async (data: any) => {
        console.log("🚨 Alerta recibida:", data)
        if (data.event === "colmenaAlert") {
          const { colmena_id, motivos, temperatura, humedad, presion, peso } = data.data

          // Crear mensajes con valores
          const mensajesConValores = motivos.map((motivo: string) => {
            const valor =
              motivo === "temperatura_baja" || motivo === "temperatura_alta"
                ? temperatura
                : motivo === "humedad_alta" || motivo === "humedad_baja"
                  ? humedad
                  : motivo === "presion_alta" || motivo === "presion_baja"
                    ? presion
                    : peso // motivo === 'peso_excesivo'
            const motivoLimpio = motivo.replace(/_/g, " ")
            return `${motivoLimpio}: ${valor}`
          })

          // Guardar en SQLite
          await saveNotificationToSQLite(colmena_id, mensajesConValores)

          // Enviar notificación local
          await sendLocalNotification(colmena_id, mensajesConValores)
        }
      }

      const sendLocalNotification = async (colmena: string, mensajes: string[]) => {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `🚨 Alerta en ${colmena}`,
              body: mensajes.join(", "),
              sound: "default",
              priority: Notifications.AndroidNotificationPriority.HIGH,
              color: "#FF6B6B",
              data: {
                colmena_id: colmena,
                mensajes: mensajes,
                timestamp: Date.now(),
              },
            },
            trigger: null, // Enviar inmediatamente
          })
          console.log("📱 Notificación local enviada para colmena:", colmena)
        } catch (error) {
          console.error("❌ Error enviando notificación local:", error)
        }
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleColmenaAlert(data)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      socket.onopen = () => {
        console.log("🟢 Conectado a WebSocket (Background)")
        setIsConnected(true); // Update the isConnected state
        if (reconnectInterval) {
          clearInterval(reconnectInterval)
          reconnectInterval = null
        }
      }

      socket.onclose = () => {
        console.log("🔴 Desconectado de WebSocket (Background)")
        setIsConnected(false); // Update the isConnected state
        if (!reconnectInterval) {
          reconnectInterval = setInterval(() => {
            console.log("🔄 Attempting to reconnect to WebSocket...")
            connectWebSocket()
          }, 5000)
        }
      }

      socket.onerror = (error) => {
        console.log("❌ Error de WebSocket (Background):", error)
        setIsConnected(false); // Update the isConnected state
      }

      const saveNotificationToSQLite = async (colmena: string, mensajes: string[]) => {
        const now = new Date()
        const id = generarID()
        const fecha = now.toLocaleDateString()
        const hora = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

        try {
          await db.runAsync(`INSERT INTO notificaciones (id, colmena, mensajes, fecha, hora) VALUES (?, ?, ?, ?, ?)`, [
            id,
            colmena,
            mensajes.join(","),
            fecha,
            hora,
          ])
          console.log("💾 Notificación guardada en SQLite:", id)
        } catch (err) {
          console.error("❌ Error insertando notificación en SQLite:", err)
        }
      }
    }

    // Add state for connection status
    const [isConnected, setIsConnected] = useState(false);

    // Initial connection attempt
    useEffect(() => {
      connectWebSocket();

      return () => {
        if (socket) {
          socket.close();
        }
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
        }
      };
    }, []);

    return { isConnected }; // Return the connection status
  }
}

export default createWebSocketHandler