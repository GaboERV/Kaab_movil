"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native"
import { Ionicons, Feather } from "@expo/vector-icons"
import { DrawerActions, useNavigation } from "@react-navigation/native"
import { useLocalSearchParams } from "expo-router"
import * as SecureStore from "expo-secure-store"
import GraficaHistorico from "../../../components/SensorChart" // Import the new component
import TimeSelecterComponent from "../../../components/SelectTimeComponent"
import { ApiBackend } from "../../../ApiBackend"

interface Parametros {
  nombre: string
  minTemp: string
  maxTemp: string
  minPresion: string
  maxPresion: string
  minHumedad: string
  maxHumedad: string
  minPeso: string
  maxPeso: string
}

interface ParametrosApi {
  temp_max: number
  temp_min: number
  humedad_min: number
  humedad_max: number
  presion_min: number
  presion_max: number
  peso_max: number
}

interface ColmenaConfig {
  _id: string
  colmena_id: string
  nombre: string
  parametros: ParametrosApi
  activo: boolean
  descripcion: string
  fecha_registro: string
}

interface DatosHistoricos {
  temperatura: number
  humedad: number
  presion: number
  peso: number
  timestamp: number
}

export default function ColmenaDetallesScreen() {
  const navigation = useNavigation()
  const { id } = useLocalSearchParams() // id de la colmena desde la URL
  const [modalVisible, setModalVisible] = useState(false)
  const [rango, setRango] = useState("minuto")
  const [datosSensoresError, setDatosSensoresError] = useState<string | null>(null)
  const [datosHistoricosError, setDatosHistoricosError] = useState<string | null>(null)
  const [loadingHistoricos, setLoadingHistoricos] = useState(false)
  const rangos = ["minuto", "hora", "día", "semana"]

  // 🧠 Estados para valores en tiempo real y configuración
  const [datosSensores, setDatosSensores] = useState({
    temperatura: null,
    presion: null,
    humedad: null,
    peso: null,
  })
  const [estado, setEstado] = useState<"activo" | "inactivo">("activo")
  const [colmenaActiva, setColmenaActiva] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [parametros, setParametros] = useState<Parametros>({
    nombre: "",
    minTemp: "",
    maxTemp: "",
    minPresion: "",
    maxPresion: "",
    minHumedad: "",
    maxHumedad: "",
    minPeso: "",
    maxPeso: "",
  })
  const [tempParametros, setTempParametros] = useState<Parametros>({
    nombre: "",
    minTemp: "",
    maxTemp: "",
    minPresion: "",
    maxPresion: "",
    minHumedad: "",
    maxHumedad: "",
    minPeso: "",
    maxPeso: "",
  })
  const [datosHistoricos, setDatosHistoricos] = useState<DatosHistoricos[]>([])

  // useCallback para obtener el token de SecureStore
  const getToken = useCallback(async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("session_token")
      setToken(storedToken)
      return storedToken
    } catch (error) {
      console.error("Error getting token:", error)
      return null
    }
  }, [])

  // 🚀 Función separada para obtener solo datos históricos
  const fetchHistoricalData = useCallback(
    async (currentRango: string) => {
      setLoadingHistoricos(true)
      setDatosHistoricosError(null)

      try {
        const currentToken = await getToken()
        if (!currentToken) {
          console.warn("No token found, aborting historical data fetch.")
          setDatosHistoricosError("No hay suficientes datos")
          return
        }

        // Determine tiempoBusqueda based on rango
        let tiempoBusqueda
        switch (currentRango) {
          case "minuto":
            tiempoBusqueda = "30m"
            break
          case "hora":
            tiempoBusqueda = "12h"
            break
          case "día":
            tiempoBusqueda = "7d"
            break
          case "semana":
            tiempoBusqueda = "8w"
            break
          default:
            tiempoBusqueda = "30m"
        }

        // Fetch historical data
        const responseHistoricos = await fetch(
          `http://${ApiBackend}:3000/datos-colmenas/historico-colmena?colmenaId=${id}&tiempoBusqueda=${tiempoBusqueda}&intervalo=${currentRango}`,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          },
        )

        if (responseHistoricos.ok) {
          const dataHistoricos: DatosHistoricos[] = await responseHistoricos.json()
          setDatosHistoricos(dataHistoricos)
          setDatosHistoricosError(null)
        } else {
          console.error("Error fetching historical data:", responseHistoricos.status)
          setDatosHistoricos([])
          setDatosHistoricosError("No hay suficientes datos")
        }
      } catch (error) {
        console.error("Error fetching historical data:", error)
        setDatosHistoricos([])
        setDatosHistoricosError("No hay suficientes datos")
      } finally {
        setLoadingHistoricos(false)
      }
    },
    [id, getToken],
  )

  // 🚀 Cargar datos principales (sin datos históricos)
  const fetchColmenaData = useCallback(async () => {
    // Limpiar estados antes de la petición
    setParametros({
      nombre: "",
      minTemp: "",
      maxTemp: "",
      minPresion: "",
      maxPresion: "",
      minHumedad: "",
      maxHumedad: "",
      minPeso: "",
      maxPeso: "",
    })
    setTempParametros({
      nombre: "",
      minTemp: "",
      maxTemp: "",
      minPresion: "",
      maxPresion: "",
      minHumedad: "",
      maxHumedad: "",
      minPeso: "",
      maxPeso: "",
    })
    setDatosSensores({
      temperatura: null,
      presion: null,
      humedad: null,
      peso: null,
    })
    setDatosSensoresError(null)

    try {
      const currentToken = await getToken()
      if (!currentToken) {
        console.warn("No token found, aborting data fetch.")
        return
      }

      const responseParametros = await fetch(`http://${ApiBackend}:3000/configuracion-colmenas/${id}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      })

      console.log("Response from colmena detalles:", responseParametros)

      if (!responseParametros.ok) {
        throw new Error(`HTTP error! status: ${responseParametros.status}`)
      }

      const dataParametros: ColmenaConfig = await responseParametros.json()

      console.log("API Response:", dataParametros)

      setParametros({
        nombre: dataParametros.nombre,
        minTemp: dataParametros.parametros.temp_max.toString(),
        maxTemp: dataParametros.parametros.temp_min.toString(),
        minPresion: dataParametros.parametros.presion_max?.toString() || "",
        maxPresion: dataParametros.parametros.presion_min?.toString() || "",
        minHumedad: dataParametros.parametros.humedad_max?.toString() || "",
        maxHumedad: dataParametros.parametros.humedad_min?.toString() || "",
        minPeso: dataParametros.parametros.peso_max?.toString() || "",
        maxPeso: "0",
      })

      setTempParametros({
        nombre: dataParametros.nombre,
        minTemp: dataParametros.parametros.temp_max.toString(),
        maxTemp: dataParametros.parametros.temp_min.toString(),
        minPresion: dataParametros.parametros.presion_max?.toString() || "",
        maxPresion: dataParametros.parametros.presion_min?.toString() || "",
        minHumedad: dataParametros.parametros.humedad_max?.toString() || "",
        maxHumedad: dataParametros.parametros.humedad_min?.toString() || "",
        minPeso: dataParametros.parametros.peso_max?.toString() || "",
        maxPeso: "0",
      })

      setEstado(dataParametros.activo ? "activo" : "inactivo")
      setColmenaActiva(dataParametros.activo)

      if (dataParametros.activo) {
        const responseDatos = await fetch(
          `http://${ApiBackend}:3000/datos-colmenas/ultimo-dato-colmena?colmenaId=${id}`,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          },
        )

        if (!responseDatos.ok) {
          console.warn(`Error fetching sensor data: HTTP error! status: ${responseDatos.status}`)
          setDatosSensoresError(`Error al obtener datos del sensor: ${responseDatos.status}.  Revisa el sensor.`)
          setDatosSensores({
            temperatura: null,
            presion: null,
            humedad: null,
            peso: null,
          })
        } else {
          setDatosSensoresError(null)
          console.log("Response from datos colmena:", responseDatos)
          const dataDatos = await responseDatos.json()
          setDatosSensores({
            temperatura: dataDatos.temperatura,
            presion: dataDatos.presion,
            humedad: dataDatos.humedad,
            peso: dataDatos.peso,
          })
        }
      } else {
        setDatosSensores({
          temperatura: null,
          presion: null,
          humedad: null,
          peso: null,
        })
        setDatosSensoresError("Colmena inactiva.  Datos de sensores no disponibles.")
      }
    } catch (error) {
      console.error("Error fetching colmena data:", error)
      setParametros({
        nombre: "",
        minTemp: "",
        maxTemp: "",
        minPresion: "",
        maxPresion: "",
        minHumedad: "",
        maxHumedad: "",
        minPeso: "",
        maxPeso: "",
      })
      setTempParametros({
        nombre: "",
        minTemp: "",
        maxTemp: "",
        minPresion: "",
        maxPresion: "",
        minHumedad: "",
        maxHumedad: "",
        minPeso: "",
        maxPeso: "",
      })
      setDatosSensores({
        temperatura: null,
        presion: null,
        humedad: null,
        peso: null,
      })
      setDatosSensoresError("Error al obtener datos de la colmena.")
    }
  }, [id, getToken])

  // Effect para cargar datos principales cuando el componente se enfoca
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchColmenaData()
      fetchHistoricalData(rango) // También cargar datos históricos iniciales
    })
    return unsubscribe
  }, [navigation, fetchColmenaData, fetchHistoricalData, rango])

  useEffect(() => {
    getToken()
  }, [getToken])

  // Effect separado solo para cambios de rango - SOLO actualiza datos históricos
  useEffect(() => {
    if (token) {
      // Solo fetch datos históricos cuando cambia el rango
      fetchHistoricalData(rango)
    }
  }, [rango, fetchHistoricalData, token])

  const handleInputChange = useCallback((name: keyof Parametros, value: string) => {
    setTempParametros((prev) => ({ ...prev, [name]: value }))
  }, [])

  const validateNumberInput = useCallback((value: string): string => {
    return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
  }, [])

  const handleAplicarCambios = async () => {
    // Validation logic remains the same...
    if (!tempParametros.nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio.")
      return
    }

    const numberFields = ["minTemp", "maxTemp", "minPresion", "maxPresion", "minHumedad", "maxHumedad", "minPeso"]

    for (const field of numberFields) {
      if (tempParametros[field] === "") {
        Alert.alert("Error", `El campo ${field} es obligatorio.`)
        return
      }
      const numValue = Number(tempParametros[field])
      if (isNaN(numValue)) {
        Alert.alert("Error", `El campo ${field} debe ser un número válido.`)
        return
      }
    }

    if (Number(tempParametros.minTemp) <= Number(tempParametros.maxTemp)) {
      Alert.alert("Error", "La temperatura mínima debe ser mayor que la temperatura máxima.")
      return
    }

    if (Number(tempParametros.minPresion) <= Number(tempParametros.maxPresion)) {
      Alert.alert("Error", "La presión mínima debe ser mayor que la presión máxima.")
      return
    }

    if (Number(tempParametros.minHumedad) <= Number(tempParametros.maxHumedad)) {
      Alert.alert("Error", "La humedad mínima debe ser mayor que la humedad máxima.")
      return
    }

    if (Number(tempParametros.minPeso) <= Number(tempParametros.maxPeso)) {
      Alert.alert("Error", "El peso mínimo debe ser mayor que el peso máximo.")
      return
    }

    try {
      const currentToken = await getToken()
      if (!currentToken) {
        console.warn("No token found, aborting data patch.")
        return
      }

      const nuevoEstadoActivo = estado === "activo"

      const response = await fetch(`http://${ApiBackend}:3000/configuracion-colmenas/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          nombre: tempParametros.nombre,
          parametros: {
            temp_max: Number(tempParametros.minTemp),
            temp_min: Number(tempParametros.maxTemp),
            humedad_max: Number(tempParametros.minHumedad),
            humedad_min: Number(tempParametros.maxHumedad),
            presion_max: Number(tempParametros.minPresion),
            presion_min: Number(tempParametros.maxPresion),
            peso_max: Number(tempParametros.minPeso),
          },
          activo: nuevoEstadoActivo,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error(`API Error: ${response.status} - ${errorBody}`)
        throw new Error(`HTTP error! status: ${response.status} - ${errorBody}`)
      }

      setParametros({ ...tempParametros })
      setModalVisible(false)
      setColmenaActiva(nuevoEstadoActivo)
      Alert.alert("Éxito", "Configuración actualizada correctamente.")
      fetchColmenaData() // Solo recargar datos principales
    } catch (error) {
      console.error("Error updating configuration:", error)
      Alert.alert("Error", "Hubo un problema al actualizar la configuración. Inténtalo de nuevo.")
    }
  }

  const toggleEstado = useCallback(() => {
    setEstado((prev) => (prev === "activo" ? "inactivo" : "activo"))
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🧭 Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Feather name="menu" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.menuText}>Menu</Text>
          <Text style={styles.kaab}>KAAB</Text>
        </View>

        {/* 🐝 Nombre y estado de la colmena */}
        <View style={styles.colmenaInfoRow}>
          <Text style={styles.colmenaNombre}>{parametros.nombre}</Text>
          <Text style={styles.statusActivo}>
            status: <Text style={{ fontWeight: "bold" }}>{estado}</Text>
          </Text>
          <TouchableOpacity
            onPress={() => {
              setTempParametros({ ...parametros })
              setModalVisible(true)
            }}
          >
            <Ionicons name="settings-outline" size={20} />
          </TouchableOpacity>
        </View>

        {/* 🔢 Datos de sensores en tiempo real */}
        <View style={styles.sensorGrid}>
          {datosSensoresError ? (
            <Text style={styles.sensorError}>{datosSensoresError}</Text>
          ) : (
            <>
              <View style={[styles.sensorCard, { backgroundColor: "#FBBF24" }]}>
                <Text style={styles.sensorTitle}>Temperatura</Text>
                <Text style={{ color: "#fff" }}>
                  {datosSensores.temperatura !== null ? `${datosSensores.temperatura} °C` : "N/A"}
                </Text>
              </View>
              <View style={[styles.sensorCard, { backgroundColor: "#1F2937" }]}>
                <Text style={styles.sensorTitle}>Presión</Text>
                <Text style={{ color: "#fff" }}>
                  {datosSensores.presion !== null ? `${datosSensores.presion} hPa` : "N/A"}
                </Text>
              </View>
              <View style={[styles.sensorCard, { backgroundColor: "#0369A1" }]}>
                <Text style={styles.sensorTitle}>Humedad</Text>
                <Text style={{ color: "#fff" }}>
                  {datosSensores.humedad !== null ? `${datosSensores.humedad} %` : "N/A"}
                </Text>
              </View>
              <View style={[styles.sensorCard, { backgroundColor: "#14B8A6" }]}>
                <Text style={styles.sensorTitle}>Peso</Text>
                <Text style={{ color: "#fff" }}>
                  {datosSensores.peso !== null ? `${datosSensores.peso} kg` : "N/A"}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* ⏳ Selector de rango de datos históricos */}
        <TimeSelecterComponent rango={rango} setRango={setRango} rangos={rangos} />

        {/* 📈 Gráfica de historial */}
        {loadingHistoricos ? (
          <View style={styles.grafica}>
            <Text>Cargando datos históricos...</Text>
          </View>
        ) : datosHistoricosError ? (
          <View style={styles.grafica}>
            <Text style={styles.historicalDataError}>{datosHistoricosError}</Text>
          </View>
        ) : datosHistoricos && datosHistoricos.length > 0 ? (
          <GraficaHistorico datos={datosHistoricos} rango={rango} />
        ) : (
          <View style={styles.grafica}>
            <Text>No hay datos históricos disponibles.</Text>
          </View>
        )}

        {/* ⚙️ Modal para configuración */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Configuración colmena {id}</Text>

              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={tempParametros.nombre}
                onChangeText={(text) => handleInputChange("nombre", text)}
              />

              <TouchableOpacity style={styles.botonDesactivar} onPress={toggleEstado}>
                <Text style={{ color: "white" }}>{estado === "activo" ? "Desactivar" : "Activar"}</Text>
              </TouchableOpacity>

              <Text style={styles.modalSubtitle}>Parámetros mínimos y máximos</Text>

              {(() => {
                const paramKeyMap: Record<string, { max: keyof Parametros; min: keyof Parametros }> = {
                  Temperatura: { max: "maxTemp", min: "minTemp" },
                  Presión: { max: "maxPresion", min: "minPresion" },
                  Humedad: { max: "maxHumedad", min: "minHumedad" },
                  Peso: { max: "maxPeso", min: "minPeso" },
                }

                return ["Temperatura", "Presión", "Humedad", "Peso"].map((param) => (
                  <View key={param}>
                    <Text>{param}</Text>
                    <View style={styles.parametrosRow}>
                      <TextInput
                        placeholder={`Min. ${param}`}
                        style={styles.inputParam}
                        value={tempParametros[paramKeyMap[param].max]}
                        onChangeText={(text) => {
                          const validatedText = validateNumberInput(text)
                          handleInputChange(paramKeyMap[param].max, validatedText)
                        }}
                        keyboardType="decimal-pad"
                      />
                      <TextInput
                        placeholder={`Max. ${param}`}
                        style={styles.inputParam}
                        value={tempParametros[paramKeyMap[param].min]}
                        onChangeText={(text) => {
                          const validatedText = validateNumberInput(text)
                          handleInputChange(paramKeyMap[param].min, validatedText)
                        }}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                ))
              })()}

              <View style={styles.botonesModal}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelar}>
                  <Text style={{ color: "white" }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.aplicar} onPress={handleAplicarCambios}>
                  <Text style={{ color: "white" }}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  colmenaInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  colmenaNombre: {
    fontWeight: "bold",
  },
  statusActivo: {
    fontSize: 12,
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
  sensorError: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  historicalDataError: {
    color: "#f87171",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  subtitulo: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 20,
  },
  tituloRango: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
  },
  rangoSelector: {
    flexDirection: "row",
    marginVertical: 10,
    gap: 8,
  },
  botonRango: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
  },
  rangoActivo: {
    backgroundColor: "#ccc",
  },
  grafica: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#e5e5e5",
    width: "85%",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSubtitle: {
    marginTop: 10,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  parametrosRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  inputParam: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#0284c7",
    borderRadius: 6,
    padding: 8,
  },
  botonesModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelar: {
    backgroundColor: "#f87171",
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
    alignItems: "center",
  },
  aplicar: {
    backgroundColor: "#10B981",
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 6,
    alignItems: "center",
  },
  botonDesactivar: {
    alignSelf: "flex-end",
    backgroundColor: "#f87171",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 10,
  },
  graphContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
  },
})
