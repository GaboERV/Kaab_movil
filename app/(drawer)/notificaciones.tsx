import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import * as SQLite from "expo-sqlite";
import { useWebSocket } from "../WebSocketContext"; // Importa el contexto



const db = SQLite.openDatabaseSync("notificaciones.db");

interface Notificacion {
  id: string;
  colmena: string;
  mensajes: string[];
  fecha: string;
  hora: string;
}

interface AlertaData {
  colmena_id: string;
  timestamp: number;
  temperatura: number;
  humedad: number;
  presion: number;
  peso: number;
  motivos: string[];
}

interface Parametros {
  temp_min: number;
  temp_max: number;
  humedad_max: number;
  humedad_min: number;
  presion_max: number;
  presion_min: number;
  peso_max: number;
}

export default function NotificacionesScreen() {
  const navigation = useNavigation<any>();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const { socket } = useWebSocket(); // Usa el contexto para acceder al socket
  const { isConnected } = useWebSocket(); // Solo necesitamos isConnected
  const [parametros, setParametros] = useState<Parametros | null>(null);

  const cargarNotificaciones = useCallback(() => {
    db.getAllAsync("SELECT * FROM notificaciones ORDER BY rowid DESC")
      .then((rows) => {
        const data: Notificacion[] = rows.map((row: any) => ({
          id: row.id,
          colmena: row.colmena,
          mensajes: row.mensajes.split(","),
          fecha: row.fecha,
          hora: row.hora,
        }));
        setNotificaciones(data);
      })
      .catch((err) => console.error("❌ Error cargando notificaciones:", err));
  }, []);

  // Use useEffect to poll for changes
  useEffect(() => {
    cargarNotificaciones(); // Load initially

    const intervalId = setInterval(() => {
      cargarNotificaciones(); // Poll for changes every x seconds
    }, 5000); // Change this value to adjust polling frequency (in milliseconds)

    return () => clearInterval(intervalId); // Clear the interval on unmount
  }, [cargarNotificaciones]);

  // Eliminar alerta
  const eliminarNotificacion = (id: string) => {
    db.runAsync("DELETE FROM notificaciones WHERE id = ?", [id])
      .then(() => cargarNotificaciones())
      .catch((err) => console.error("❌ Error eliminando notificación:", err));
  };

  const renderItem = ({ item }: { item: Notificacion }) => (
    <TouchableOpacity
      onLongPress={() =>
        Alert.alert("Eliminar alerta", "¿Deseas eliminar esta notificación?", [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => eliminarNotificacion(item.id),
          },
        ])
      }
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.alerta}>
          <Text style={{ fontWeight: "bold" }}>Alerta {item.colmena}</Text>
        </Text>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.fecha}>{item.fecha} </Text>
          <Text style={styles.hora}>{item.hora} </Text>
        </View>
      </View>
      {item.mensajes.map((msg, index) => (
        <Text key={index} style={styles.mensaje}>
          {msg}
        </Text>
      ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <Feather name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.menuText}>Menu</Text>
        <Text style={styles.kaab}>KAAB</Text>
      </View>
      <Text style={styles.titulo}>Notificaciones</Text>

      <FlatList
        data={notificaciones}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  menuText: {
    marginLeft: -130,
    fontSize: 16,
  },
  kaab: {
    fontWeight: "bold",
    fontSize: 14,
  },
  titulo: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#f87171",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  alerta: {
    color: "#fff",
    fontSize: 14,
  },
  fecha: {
    color: "#fff",
    fontSize: 12,
  },
  hora: {
    color: "#fff",
    fontSize: 12,
  },
  mensaje: {
    color: "#fff",
    fontSize: 13,
  },
});