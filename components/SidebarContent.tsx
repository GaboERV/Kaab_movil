import React from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SidebarContent(props: any) {
  const router = useRouter();

  const handleLogout = async () => {
    // ✅ Aquí deberías limpiar la sesión del usuario:

    // 1. Eliminar token de sesión seguro
    // Ejemplo si usas SecureStore de Expo:
    // import * as SecureStore from 'expo-secure-store';
    // await SecureStore.deleteItemAsync('session_token');

    // 2. Limpiar estado global si usas contexto:
    // authContext.logout();

    // 3. (Opcional) Notificar al backend que cerró sesión:
    // await fetch(`${API_URL}/logout`, {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // });

    // 4. Redirigir al login global
    router.replace('/index');
  };


  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      {/* Título */}
      <Text style={styles.title}>KAAB</Text>

      {/* Navegación */}
      <DrawerItemList {...props} />

      {/* Footer con botón cerrar sesión */}
      <View style={styles.footer}>
        <DrawerItem
          label="Cerrar sesión"
          labelStyle={styles.logoutLabel}
          style={styles.logoutButton}
          onPress={handleLogout}
        />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#f87171',
    borderRadius: 8,
  },
  logoutLabel: {
    color: '#fff',
    fontWeight: '600',
  },
});
