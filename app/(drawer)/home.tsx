import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ApiBackend } from "../../ApiBackend";
interface Colmena {
  colmena_id: string;
  nombre: string;
  fecha_registro: string;
  activo: "activo" | "inactivo";
}

interface SensorData {
  colmena_id: string;
  temperatura: number;
  humedad: number;
  presion: number;
  peso: number;
  timestamp: number;
}

export default function HomeScreen() {
  const [busqueda, setBusqueda] = useState("");
  const [colmenas, setColmenas] = useState<Colmena[]>([]); // ← 🔁 Reemplaza colmenasEjemplo
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [averageTemperature, setAverageTemperature] = useState<number | null>(
    null
  );
  const [averageHumidity, setAverageHumidity] = useState<number | null>(null);
  const [averagePressure, setAveragePressure] = useState<number | null>(null);
  const [averageWeight, setAverageWeight] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const fetchColmenas = async () => {
        try {
          const token = await SecureStore.getItemAsync("session_token");

          if (!token) {
            console.warn("No se encontró el token");
            return;
          }

          const response = await fetch(
            `http://${ApiBackend}:3000/configuracion-colmenas`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const data = await response.json();

          if (!Array.isArray(data)) {
            console.warn("La respuesta de la API no es un array:", data);
            setColmenas([]);
            return;
          }

          const transformedData = data.map((colmena) => {
            let activo = colmena.activo;
            if (colmena.activo === true) {
              activo = "activo";
            } else if (colmena.activo === false) {
              activo = "inactivo";
            } else {
              activo = "desconocido";
            }
            // Formatea la fecha a "YYYY-MM-DD"
            const fecha_registro = colmena.fecha_registro
              ? colmena.fecha_registro.split("T")[0]
              : "";
            return { ...colmena, activo, fecha_registro };
          });

          setColmenas(transformedData);
        } catch (error) {
          console.error("Error fetching colmenas:", error);
          setColmenas([]);
        } finally {
          setIsLoading(false);
        }
      };

      const fetchSensorData = async () => {
        try {
          const token = await SecureStore.getItemAsync("session_token");

          if (!token) {
            console.warn("No se encontró el token");
            return;
          }

          const response = await fetch(
            `http://${ApiBackend}:3000/datos-colmenas/ultimo-dato-colmenas`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const data = await response.json();
          if (!Array.isArray(data)) {
            console.warn("La respuesta de la API no es un array:", data);
            setSensorData([]);
            return;
          }

          setSensorData(data);
          // Calculate averages
          if (data.length > 0) {
            const totalTemperature = data.reduce(
              (sum, item) => sum + item.temperatura,
              0
            );
            setAverageTemperature(totalTemperature / data.length);

            const totalHumidity = data.reduce(
              (sum, item) => sum + item.humedad,
              0
            );
            setAverageHumidity(totalHumidity / data.length);

            const totalPressure = data.reduce(
              (sum, item) => sum + item.presion,
              0
            );
            setAveragePressure(totalPressure / data.length);

            const totalWeight = data.reduce((sum, item) => sum + item.peso, 0);
            setAverageWeight(totalWeight / data.length);
          } else {
            setAverageTemperature(null);
            setAverageHumidity(null);
            setAveragePressure(null);
            setAverageWeight(null);
          }
        } catch (error) {
          console.error("Error fetching sensor data:", error);
          setSensorData([]);
        }
      };
      setIsLoading(true);
      fetchColmenas();
      fetchSensorData();
    });

    return unsubscribe;
  }, [navigation]);

  const filtrarColmenas = colmenas.filter((colmena) =>
    colmena.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderColmena = ({ item }: { item: Colmena }) => (
    <TouchableOpacity
      onPress={() =>
        router.push(`/(drawer)/colmena-detalles/${item.colmena_id}`)
      }
      style={[
        styles.colmenaCard,
        item.activo === "activo" ? styles.activa : styles.inactiva,
      ]}
    >
      <View style={styles.colmenaInfo}>
        <Text style={styles.colmenaNombre}>{item.nombre}</Text>
        <Text style={styles.colmenaFecha}>
          fecha de creación: {item.fecha_registro}
        </Text>
      </View>
      <Text style={styles.status}>
        status:{" "}
        <Text style={{ fontWeight: "bold" }}>{item.activo}</Text>
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <Text>Cargando colmenas...</Text> // Or a loading spinner
      ) : (
        <View>
          {/* 🧭 Encabezado */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Feather name="menu" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.menuText}>Menu</Text>
            <Text style={styles.kaab}>KAAB</Text>
          </View>
          <Text style={styles.subtitulo}>datos generales</Text>
          {/* 📡 Aquí también se puede agregar lógica para traer datos generales desde el backend */}
          {/* Por ejemplo: temperatura promedio, humedad, presión, etc. */}
          {/* Actualmente los datos de sensores son solo placeholders visuales */}
          <View style={styles.sensorGrid}>
            <View style={[styles.sensorCard, { backgroundColor: "#FBBF24" }]}>
              <Text style={styles.sensorTitle}>Temperatura</Text>
              <Ionicons name="sunny-outline" size={20} color="#fff" />
              <Text style={styles.sensorValue}>
                {averageTemperature !== null
                  ? averageTemperature.toFixed(1)
                  : "N/A"}{" "}
                °C
              </Text>
            </View>
            <View style={[styles.sensorCard, { backgroundColor: "#1F2937" }]}>
              <Text style={styles.sensorTitle}>Presión</Text>
              <Ionicons name="speedometer-outline" size={20} color="#fff" />
              <Text style={styles.sensorValue}>
                {averagePressure !== null
                  ? averagePressure.toFixed(1)
                  : "N/A"}{" "}
                hPa
              </Text>
            </View>
            <View style={[styles.sensorCard, { backgroundColor: "#0369A1" }]}>
              <Text style={styles.sensorTitle}>Humedad</Text>
              <Ionicons name="water-outline" size={20} color="#fff" />
              <Text style={styles.sensorValue}>
                {averageHumidity !== null
                  ? averageHumidity.toFixed(1)
                  : "N/A"}{" "}
                %
              </Text>
            </View>
            <View style={[styles.sensorCard, { backgroundColor: "#14B8A6" }]}>
              <Text style={styles.sensorTitle}>Peso</Text>
              <Ionicons name="barbell-outline" size={20} color="#fff" />
              <Text style={styles.sensorValue}>
                {averageWeight !== null ? averageWeight.toFixed(1) : "N/A"} kg
              </Text>
            </View>
          </View>
          <Text style={styles.subtitulo}>lista de colmenas</Text>
          <View style={styles.searchBox}>
            <TextInput
              placeholder="buscar"
              value={busqueda}
              onChangeText={setBusqueda}
              style={styles.input}
            />
            <Ionicons name="search" size={20} color="#000" />
          </View>
          {/* 📋 Lista dinámica de colmenas */}
          <FlatList
            data={filtrarColmenas}
            keyExtractor={(item) => item.colmena_id}
            renderItem={renderColmena}
            style={{ maxHeight: 300 }} // Set a maximum height
            contentContainerStyle={{ paddingBottom: 10 }}
          />
        </View>
      )}
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
  subtitulo: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 10,
  },
  sensorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  sensorCard: {
    width: "48%",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  sensorTitle: {
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 5,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 10,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  colmenaCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activa: {
    backgroundColor: "#10B981",
  },
  inactiva: {
    backgroundColor: "#F87171",
  },
  colmenaInfo: {
    gap: 2,
  },
  colmenaNombre: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 16,
  },
  colmenaFecha: {
    fontSize: 12,
    color: "#fff",
  },
  status: {
    fontSize: 12,
    color: "#fff",
  },
});