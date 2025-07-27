import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import WaveBackground from '../components/WaveBackground';
import { ApiBackend } from './ApiBackend'; // Importa la dirección del backend

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const validateEmail = (email: string) =>
    /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email);

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let valid = true;

    if (!validateEmail(email)) {
      newErrors.email = 'Correo inválido';
      valid = false;
    }

    if (password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      // 🔒 Lógica de autenticación con backend (POST /auth/login)
      const response = await fetch(`http://${ApiBackend}:3000/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejo de errores de backend (credenciales inválidas, usuario no encontrado, etc.)
        setErrors({ ...errors, password: data.message || 'Error de autenticación' });
        return;
      }

      // ✅ Guardar token o datos del usuario en SecureStore o AsyncStorage
      await SecureStore.setItemAsync('session_token', data.token);

      // 👉 Redirigir a la pantalla principal tras login exitoso
      router.replace('/(drawer)/home');

    } catch (error) {
      console.error('❌ Error al iniciar sesión:', error);
      setErrors({ ...errors, password: 'Error de red o servidor' });
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('session_token');
        if (token) {
          // Token existe, redirigir a la pantalla principal
          router.replace('/(drawer)/home'); // Usa replace para evitar volver atrás
        }
      } catch (error) {
        console.error('Error checking token:', error);
      }
    };

    checkToken();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <WaveBackground />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.content}>
            <Text style={styles.logo}>KAAB</Text>
            <Text style={styles.loginTitle}>Login</Text>

            <View
              style={[
                styles.formContainer,
                isTablet && { width: '60%', padding: 30 },
              ]}
            >
              {/* Email */}
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Email"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#6B7280"
                />
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
              </View>
              {errors.email && <Text style={styles.error}>{errors.email}</Text>}

              {/* Contraseña */}
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Contraseña"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#6B7280"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}

              {/* Botón de login */}
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 6,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  formContainer: {
    width: '90%',
    gap: 10,
    paddingVertical: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '100%',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
    marginLeft: 6,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#2563EB',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textTransform: 'lowercase',
    fontWeight: '600',
  },
});