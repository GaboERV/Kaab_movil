"use client"

import React, { useState, useMemo } from "react"
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native"
import { LineChart } from "react-native-chart-kit"

interface GraficaHistoricoProps {
  datos: any[]
  rango: string // Nuevo prop para el rango
}

const GraficaHistorico: React.FC<GraficaHistoricoProps> = React.memo(({ datos, rango }) => {
  const [activeTab, setActiveTab] = useState("Temperatura")

  // Función para formatear las etiquetas según el rango
  const formatTimestampLabel = (timestamp: number, rangeType: string): string => {
    const date = new Date(timestamp * 1000)

    switch (rangeType) {
      case "minuto":
        // Formato: HH:MM
        return date.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })

      case "hora":
        // Formato: HH:00
        return date.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })

      case "día":
        // Formato: DD/MM
        return date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
        })

      case "semana":
        // Formato: DD/MM
        return date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
        })

      default:
        return date.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })
    }
  }

  // Función para obtener el título del rango
  const getRangeTitle = (rangeType: string): string => {
    switch (rangeType) {
      case "minuto":
        return "Últimos 30 minutos"
      case "hora":
        return "Últimas 12 horas"
      case "día":
        return "Últimos 7 días"
      case "semana":
        return "Últimas 8 semanas"
      default:
        return "Datos históricos"
    }
  }

  // Memoizar los datos procesados para evitar recálculos innecesarios
  const processedData = useMemo(() => {
    if (!datos || datos.length === 0) {
      return {
        temperatureData: [],
        humidityData: [],
        pressureData: [],
        weightData: [],
        timeLabels: [],
      }
    }

    // Data extraction
    const temperatureData = datos.map((item) => item.temperatura || 0)
    const humidityData = datos.map((item) => item.humedad || 0)
    const pressureData = datos.map((item) => item.presion || 0)
    const weightData = datos.map((item) => item.peso || 0)

    // Formatear etiquetas de tiempo según el rango
    const timeLabels = datos.map((item) => formatTimestampLabel(item.timestamp, rango))

    // Para evitar etiquetas muy largas en el gráfico, limitamos la cantidad mostrada
    const maxLabels = 6
    const step = Math.ceil(timeLabels.length / maxLabels)
    const filteredLabels = timeLabels.filter((_, index) => index % step === 0)

    return {
      temperatureData,
      humidityData,
      pressureData,
      weightData,
      timeLabels: filteredLabels,
      originalLabels: timeLabels,
    }
  }, [datos, rango])

  // Chart Config memoizado
  const chartConfig = useMemo(
    () => ({
      backgroundColor: "#ffffff",
      backgroundGradientFrom: "#ffffff",
      backgroundGradientTo: "#ffffff",
      decimalPlaces: 1,
      color: (opacity = 1) => `rgba(150, 150, 150, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(50, 50, 50, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: "3",
        strokeWidth: "2",
        stroke: "#999999",
      },
      withHorizontalLines: true,
      withVerticalLines: false,
      fillShadowGradient: "#eeeeee",
      fillShadowGradientOpacity: 0.3,
      propsForLabels: {
        fontSize: 10,
      },
    }),
    [],
  )

  // Memoizar los datos del gráfico basados en la pestaña activa
  const chartData = useMemo(() => {
    const { temperatureData, humidityData, pressureData, weightData, timeLabels } = processedData

    let data: number[] = []
    let color = "rgba(150, 150, 150, 1)"

    switch (activeTab) {
      case "Temperatura":
        data = temperatureData
        color = "rgba(251, 191, 36, 1)" // Amarillo
        break
      case "Humedad":
        data = humidityData
        color = "rgba(3, 105, 161, 1)" // Azul
        break
      case "Presión":
        data = pressureData
        color = "rgba(31, 41, 55, 1)" // Gris oscuro
        break
      case "Peso":
        data = weightData
        color = "rgba(20, 184, 166, 1)" // Verde azulado
        break
      default:
        data = temperatureData
    }

    // Si no hay datos, retornar datos por defecto
    if (data.length === 0) {
      return {
        labels: ["Sin datos"],
        datasets: [
          {
            data: [0],
            color: (opacity = 1) => `rgba(150, 150, 150, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      }
    }

    // Filtrar datos para que coincidan con las etiquetas filtradas
    const maxLabels = 6
    const step = Math.ceil(data.length / maxLabels)
    const filteredData = data.filter((_, index) => index % step === 0)

    return {
      labels: timeLabels,
      datasets: [
        {
          data: filteredData.length > 0 ? filteredData : data,
          color: (opacity = 1) => color.replace("1)", `${opacity})`),
          strokeWidth: 3,
        },
      ],
    }
  }, [processedData, activeTab])

  // Función para obtener la unidad según el tipo de dato
  const getUnit = (tab: string): string => {
    switch (tab) {
      case "Temperatura":
        return "°C"
      case "Humedad":
        return "%"
      case "Presión":
        return "hPa"
      case "Peso":
        return "kg"
      default:
        return ""
    }
  }

  // Si no hay datos, mostrar mensaje
  if (!datos || datos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.rangeTitle}>{getRangeTitle(rango)}</Text>
        </View>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No hay datos históricos disponibles</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header con título del rango */}
      <View style={styles.headerContainer}>
        <Text style={styles.rangeTitle}>{getRangeTitle(rango)}</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {["Temperatura", "Humedad", "Presión", "Peso"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <View style={styles.graphContainer}>
        <LineChart
          data={chartData}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={{
            borderRadius: 16,
          }}
          withDots={datos.length <= 20} // Solo mostrar puntos si hay pocos datos
          withShadow={false}
        />

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View
            style={[
              styles.legendIcon,
              {
                backgroundColor:
                  activeTab === "Temperatura"
                    ? "#FBBF24"
                    : activeTab === "Humedad"
                      ? "#0369A1"
                      : activeTab === "Presión"
                        ? "#1F2937"
                        : "#14B8A6",
              },
            ]}
          />
          <Text style={styles.legendText}>
            {activeTab} ({getUnit(activeTab)})
          </Text>
        </View>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    height: 400,
    width: "100%",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    marginVertical: 20,
  },
  headerContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  rangeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#e9ecef",
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    marginHorizontal: 2,
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    color: "#495057",
    fontSize: 12,
    fontWeight: "500",
  },
  activeTabButtonText: {
    fontWeight: "bold",
    color: "#212529",
  },
  graphContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 15,
    paddingTop: 10,
  },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  legendIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
})

export default GraficaHistorico
