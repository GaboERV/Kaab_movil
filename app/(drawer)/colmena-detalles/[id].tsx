import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';

export default function ColmenaDetallesScreen() {
  const navigation = useNavigation<any>();
  const { id } = useLocalSearchParams(); // id de la colmena desde la URL

  const [modalVisible, setModalVisible] = useState(false);
  const [rango, setRango] = useState('minuto');

  const rangos = ['minuto', 'hora', 'día', 'semana'];

  // 🧠 Estados para valores en tiempo real y configuración
  const [datosSensores, setDatosSensores] = useState({
    temperatura: 0,
    presion: 0,
    humedad: 0,
    peso: 0,
  });

  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo');

  const [parametros, setParametros] = useState({
    nombre: '',
    minTemp: '',
    maxTemp: '',
    minPresion: '',
    maxPresion: '',
    minHumedad: '',
    maxHumedad: '',
    minPeso: '',
    maxPeso: '',
  });

  // 🚀 Cargar datos al iniciar
  useEffect(() => {
    // 🔗 Aquí deberás hacer una petición GET al backend con el ID de la colmena
    // Ejemplo: GET `/api/colmenas/{id}`
    // setDatosSensores({ ... }) y setParametros({ ... })

    // 🔧 Simulación temporal:
    setParametros({
      nombre: 'Colmena Demo',
      minTemp: '30',
      maxTemp: '38',
      minPresion: '980',
      maxPresion: '1020',
      minHumedad: '50',
      maxHumedad: '80',
      minPeso: '10',
      maxPeso: '30',
    });

    setDatosSensores({
      temperatura: 34,
      presion: 1005,
      humedad: 67,
      peso: 22,
    });

    setEstado('activo'); // también deberás obtener esto desde el backend
  }, [id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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
          <Text style={styles.colmenaNombre}>Colmena {id}</Text>
          <Text style={styles.statusActivo}>
            status: <Text style={{ fontWeight: 'bold' }}>{estado}</Text>
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="settings-outline" size={20} />
          </TouchableOpacity>
        </View>

        {/* 🔢 Datos de sensores en tiempo real */}
        <View style={styles.sensorGrid}>
          <View style={[styles.sensorCard, { backgroundColor: '#FBBF24' }]}>
            <Text style={styles.sensorTitle}>Temperatura</Text>
            <Text style={{ color: '#fff' }}>{datosSensores.temperatura} °C</Text>
          </View>
          <View style={[styles.sensorCard, { backgroundColor: '#1F2937' }]}>
            <Text style={styles.sensorTitle}>Presión</Text>
            <Text style={{ color: '#fff' }}>{datosSensores.presion} hPa</Text>
          </View>
          <View style={[styles.sensorCard, { backgroundColor: '#0369A1' }]}>
            <Text style={styles.sensorTitle}>Humedad</Text>
            <Text style={{ color: '#fff' }}>{datosSensores.humedad} %</Text>
          </View>
          <View style={[styles.sensorCard, { backgroundColor: '#14B8A6' }]}>
            <Text style={styles.sensorTitle}>Peso</Text>
            <Text style={{ color: '#fff' }}>{datosSensores.peso} kg</Text>
          </View>
        </View>

        {/* ⏳ Selector de rango de datos históricos */}
        <Text style={styles.subtitulo}>Datos promediados</Text>
        <Text style={styles.tituloRango}>Último {rango}</Text>
        <View style={styles.rangoSelector}>
          {rangos.map((opcion) => (
            <TouchableOpacity
              key={opcion}
              style={[
                styles.botonRango,
                rango === opcion && styles.rangoActivo,
              ]}
              onPress={() => {
                setRango(opcion);
                // 📊 Aquí puedes hacer la llamada al backend con `/api/colmenas/{id}/historico?rango=...`
              }}
            >
              <Text>{opcion}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 📈 Placeholder de gráfica de historial */}
        <View style={styles.grafica}>
          {/* Aquí iría tu componente gráfico con datos históricos */}
          <Text>Gráfica de temperatura</Text>
          <Text>[📈 Placeholder]</Text>
        </View>

        {/* ⚙️ Modal para configuración */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Configuración colmena {id}</Text>

              {/* 📝 Nombre editable */}
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={parametros.nombre}
                onChangeText={(text) => setParametros({ ...parametros, nombre: text })}
              />

              {/* 🔴 Desactivar colmena (debe mandar PATCH al backend) */}
              <TouchableOpacity style={styles.botonDesactivar}>
                <Text style={{ color: 'white' }}>Desactivar</Text>
              </TouchableOpacity>

              <Text style={styles.modalSubtitle}>Parámetros mínimos y máximos</Text>

              {['Temperatura', 'Presión', 'Humedad', 'Peso'].map((param) => (
                <View key={param}>
                  <Text>{param}</Text>
                  <View style={styles.parametrosRow}>
                    <TextInput placeholder="Max." style={styles.inputParam} />
                    <TextInput placeholder="Min." style={styles.inputParam} />
                  </View>
                </View>
              ))}

              <View style={styles.botonesModal}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelar}>
                  <Text style={{ color: 'white' }}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.aplicar}
                  onPress={() => {
                    // ✅ Aquí deberás hacer PATCH `/api/colmenas/{id}/configuracion`
                    // con los valores de `parametros`
                    setModalVisible(false);
                  }}
                >
                  <Text style={{ color: 'white' }}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  menuText: {
    marginLeft: -130,
    fontSize: 16,
  },
  kaab: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  colmenaInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  colmenaNombre: {
    fontWeight: 'bold',
  },
  statusActivo: {
    fontSize: 12,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sensorCard: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  sensorTitle: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 20,
  },
  tituloRango: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
  },
  rangoSelector: {
    flexDirection: 'row',
    marginVertical: 10,
    gap: 8,
  },
  botonRango: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
  },
  rangoActivo: {
    backgroundColor: '#ccc',
  },
  grafica: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#e5e5e5',
    width: '85%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    marginTop: 10,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  parametrosRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  inputParam: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0284c7',
    borderRadius: 6,
    padding: 8,
  },
  botonesModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelar: {
    backgroundColor: '#f87171',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
    alignItems: 'center',
  },
  aplicar: {
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 6,
    alignItems: 'center',
  },
  botonDesactivar: {
    alignSelf: 'flex-end',
    backgroundColor: '#f87171',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 10,
  },
});
