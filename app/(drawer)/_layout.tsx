import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import SidebarContent from '../../components/SidebarContent';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: { backgroundColor: '#f3f4f6', width: 250 },
      }}
      drawerContent={(props) => <SidebarContent {...props} />}
    >
      {/* Página principal visible en el sidebar */}
      <Drawer.Screen
        name="home"
        options={{
          drawerLabel: 'Inicio',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Página de notificaciones visible en el sidebar */}
      <Drawer.Screen
        name="notificaciones"
        options={{
          drawerLabel: 'Notificaciones',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Pantalla de detalles de colmena (oculta del drawer, pero accesible por navegación) */}
      <Drawer.Screen
        name="colmena-detalles/[id]"
        options={{
          drawerItemStyle: { height: 0 }, // oculta completamente del drawer
          drawerLabel: () => null,
          title: undefined,
          drawerIcon: () => null,
        }}
      />
    </Drawer>
  );
}
