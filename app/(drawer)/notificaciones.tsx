import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';


function generarID() {
  return Math.random().toString(36).substring(2, 12) + Date.now().toString();
}

const db = SQLite.openDatabaseSync('notificaciones.db');

interface Notificacion {
  id: string;
  colmena: string;
  mensajes: string[];
  fecha: string;
}

export default function NotificacionesScreen() {
  const navigation = useNavigation<any>();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  // Crear tabla SQLite
  useEffect(() => {
    db.execAsync(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id TEXT PRIMARY KEY NOT NULL,
        colmena TEXT,
        mensajes TEXT,
        fecha TEXT
      );
    `)
      .then(() => cargarNotificaciones())
      .catch((err) => console.error('❌ Error creando tabla:', err));
  }, []);

  // Cargar notificaciones
  const cargarNotificaciones = () => {
    db.getAllAsync('SELECT * FROM notificaciones ORDER BY rowid DESC')
      .then((rows) => {
        const data: Notificacion[] = rows.map((row: any) => ({
          id: row.id,
          colmena: row.colmena,
          mensajes: row.mensajes.split(','),
          fecha: row.fecha,
        }));
        setNotificaciones(data);
      })
      .catch((err) => console.error('❌ Error cargando notificaciones:', err));
  };

  // Agregar notificación local desde el backend (ejemplo)
  const agregarNotificacion = async (colmena: string, mensajes: string[]) => {
    const nueva: Notificacion = {
      id: generarID(),
      colmena,
      mensajes,
      fecha: new Date().toLocaleDateString(),
    };

    db.runAsync(
      `INSERT INTO notificaciones (id, colmena, mensajes, fecha) VALUES (?, ?, ?, ?)`,
      [nueva.id, nueva.colmena, nueva.mensajes.join(','), nueva.fecha]
    )
      .then(() => cargarNotificaciones())
      .catch((err) => console.error('❌ Error insertando notificación:', err));
  };

  // 🧪 Botón de prueba para simular datos
  const simularNotificacion = () => {
    // 📌 En producción, esta función sería reemplazada por lógica que detecte
    // desde el backend si una colmena excede sus límites, por ejemplo:
    // const response = await fetch(`${API_URL}/alertas`);
    // if (response.status === 200) agregarNotificacion(...);

    agregarNotificacion('colmena simulada', [
      'temperatura elevada: 42',
      'humedad baja: 12%',
    ]);
  };

  // Eliminar alerta
  const eliminarNotificacion = (id: string) => {
    db.runAsync('DELETE FROM notificaciones WHERE id = ?', [id])
      .then(() => cargarNotificaciones())
      .catch((err) => console.error('❌ Error eliminando notificación:', err));
  };

  const renderItem = ({ item }: { item: Notificacion }) => (
    <TouchableOpacity
      onLongPress={() =>
        Alert.alert(
          'Eliminar alerta',
          '¿Deseas eliminar esta notificación?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', style: 'destructive', onPress: () => eliminarNotificacion(item.id) },
          ]
        )
      }
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.alerta}>
          <Text style={{ fontWeight: 'bold' }}>Alerta {item.colmena}</Text>
        </Text>
        <Text style={styles.fecha}>{item.fecha}</Text>
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
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
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

      {/* Botón de prueba */}
      <TouchableOpacity style={styles.testButton} onPress={simularNotificacion}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>+ Simular alerta</Text>
      </TouchableOpacity>
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
  titulo: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#f87171',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alerta: {
    color: '#fff',
    fontSize: 14,
  },
  fecha: {
    color: '#fff',
    fontSize: 12,
  },
  mensaje: {
    color: '#fff',
    fontSize: 13,
  },
  testButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    width: '90%',
  },
});
