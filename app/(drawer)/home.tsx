import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

interface Colmena {
  id: string;
  nombre: string;
  fechaCreacion: string;
  status: 'activo' | 'inactivo';
}

export default function HomeScreen() {
  const [busqueda, setBusqueda] = useState('');
  const [colmenas, setColmenas] = useState<Colmena[]>([]); // ← 🔁 Reemplaza colmenasEjemplo
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    // 🔗 Aquí va la lógica para obtener las colmenas desde el backend
    // Por ejemplo: fetch('https://tu-api/colmenas').then(...).catch(...)
    // Usa setColmenas para actualizar el estado
    const datosSimulados: Colmena[] = [
      {
        id: '1',
        nombre: 'Colmena X',
        fechaCreacion: '1/1/20XX',
        status: 'activo',
      },
      {
        id: '2',
        nombre: 'Colmena Y',
        fechaCreacion: '2/2/20XX',
        status: 'inactivo',
      },
    ];
    setColmenas(datosSimulados);
  }, []);

  const filtrarColmenas = colmenas.filter((colmena) =>
    colmena.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderColmena = ({ item }: { item: Colmena }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(drawer)/colmena-detalles/${item.id}`)}
      style={[
        styles.colmenaCard,
        item.status === 'activo' ? styles.activa : styles.inactiva,
      ]}
    >
      <View style={styles.colmenaInfo}>
        <Text style={styles.colmenaNombre}>{item.nombre}</Text>
        <Text style={styles.colmenaFecha}>
          fecha de creación: {item.fechaCreacion}
        </Text>
      </View>
      <Text style={styles.status}>
        status: <Text style={{ fontWeight: 'bold' }}>{item.status}</Text>
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 🧭 Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
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
        <View style={[styles.sensorCard, { backgroundColor: '#FBBF24' }]}>
          <Text style={styles.sensorTitle}>Temperatura</Text>
          <Ionicons name="sunny-outline" size={20} color="#fff" />
        </View>
        <View style={[styles.sensorCard, { backgroundColor: '#1F2937' }]}>
          <Text style={styles.sensorTitle}>Presión</Text>
          <Ionicons name="speedometer-outline" size={20} color="#fff" />
        </View>
        <View style={[styles.sensorCard, { backgroundColor: '#0369A1' }]}>
          <Text style={styles.sensorTitle}>Humedad</Text>
          <Ionicons name="water-outline" size={20} color="#fff" />
        </View>
        <View style={[styles.sensorCard, { backgroundColor: '#14B8A6' }]}>
          <Text style={styles.sensorTitle}>Peso</Text>
          <Ionicons name="barbell-outline" size={20} color="#fff" />
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
        keyExtractor={(item) => item.id}
        renderItem={renderColmena}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
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
  subtitulo: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
    marginBottom: 10,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activa: {
    backgroundColor: '#10B981',
  },
  inactiva: {
    backgroundColor: '#F87171',
  },
  colmenaInfo: {
    gap: 2,
  },
  colmenaNombre: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
  },
  colmenaFecha: {
    fontSize: 12,
    color: '#fff',
  },
  status: {
    fontSize: 12,
    color: '#fff',
  },
});
