// RootLayout.js
"use client"

import { useEffect, useState, useCallback, useContext, useRef } from "react"
import { Stack, useRouter } from "expo-router"
import { View, Platform, BackHandler } from "react-native"
import * as Notifications from "expo-notifications"
import * as SQLite from "expo-sqlite"

import { WebSocketProvider, WebSocketContext, useWebSocket } from "./WebSocketContext"
import createWebSocketHandler from "./websocketHandler"
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ApiBackend } from './ApiBackend'; // Importa la dirección del backend


// Configuración básica de notificaciones locales
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const RootLayout = () => {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const [contextValue, setContextValue] = useState({
    isDbInitialized: false,
    db: null,
  });

  const initDb = useCallback(async () => {
    try {
      const newDb = SQLite.openDatabaseSync("notificaciones.db");
      setDb(newDb);

      try {
        if (newDb) {
          await newDb.execAsync(
            `
                        CREATE TABLE IF NOT EXISTS notificaciones (
                          id TEXT PRIMARY KEY NOT NULL,
                          colmena TEXT,
                          mensajes TEXT,
                          fecha TEXT,
                          hora TEXT
                        );
                      `,
          );
          console.log("✅ Base de datos inicializada correctamente");
          setIsDbInitialized(true);
          setContextValue({ isDbInitialized: true, db: newDb }); // Actualiza el valor del contexto aquí
        } else {
          console.error("❌ Error opening database: newDb is null");
          Alert.alert("Error", "Failed to open database.");
          setIsDbInitialized(false);
          setContextValue({ isDbInitialized: false, db: null });
        }
      } catch (error) {
        console.error("❌ Error executing SQL:", error);
        Alert.alert("Error", "Failed to initialize database.");
        setIsDbInitialized(false);
        setContextValue({ isDbInitialized: false, db: null });
      }
    } catch (error) {
      console.error("❌ Error opening database:", error);
      Alert.alert("Error", "Failed to open database.");
      setIsDbInitialized(false);
      setContextValue({ isDbInitialized: false, db: null });
    }
  }, []);

  // Configuración básica de permisos para notificaciones locales
  const setupLocalNotifications = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Alertas de Colmenas",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "default",
        description: "Notificaciones de alertas del sistema KAAB",
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert("Permisos requeridos", "Las notificaciones son necesarias para recibir alertas de las colmenas.", [
        { text: "OK" },
      ]);
    }
  };

  useEffect(() => {
    initDb();
  }, [initDb]);

  useEffect(() => {
    // Configurar notificaciones locales
    setupLocalNotifications();

    // Listener para notificaciones recibidas mientras la app está abierta
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("🔔 Notificación recibida:", notification);
      setNotification(notification);
    });

    // Listener para cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("👆 Usuario tocó la notificación:", response);

      // Aquí puedes navegar a una pantalla específica basada en la notificación
      const data = response.notification.request.content.data;
      if (data?.colmena_id) {
        console.log("Navegando a colmena:", data.colmena_id);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <WebSocketProvider value={contextValue}>
      <RootLayoutNavigation />
    </WebSocketProvider>
  );
};



function RootLayoutNavigation() {
  const { isDbInitialized, db, isConnected } = useWebSocket();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('session_token');
        if (token) {
          // Si hay un token, redirige a la pantalla principal
          router.replace('(drawer)/home');
        }
      } catch (error) {
        console.error('Error checking token:', error);
        // Maneja el error según sea necesario
      }
    };

    checkAuth();

    // Función para manejar el evento de retroceso del hardware
    const backAction = () => {
      // Si estamos en la pantalla de índice, evitamos que vuelva atrás
      if (router.canGoBack()) {
          router.back(); // Or any other logic you need
      } else {
          return true; // Prevent back navigation
      }
      return true; // Evita el comportamiento por defecto
    };

    // Agrega el listener para el evento de retroceso
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Elimina el listener cuando el componente se desmonta
    return () => {
      backHandler.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Puedes usar isDbInitialized e isConnected para mostrar un indicador de carga o un mensaje de error */}
      {/* Por ejemplo: */}
      {/* {!isDbInitialized && <Text>Initializing database...</Text>} */}
      {/* {!isConnected && <Text>Connecting to WebSocket...</Text>} */}

      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(drawer)" />
      </Stack>
    </View>
  );
}

export default RootLayout;