import { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../constants/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required');
      valid = false;
    } else if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Invalid email format');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    }

    if (!valid) {
      Alert.alert('Error', 'Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Login failed', data.message);
        return;
      }

      login(data.user, data.token);
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={[styles.input, emailError ? styles.inputError : null]}
        placeholder="Email"
        value={email}
        onChangeText={(text) => { setEmail(text); setEmailError(''); }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <TextInput
        style={[styles.input, passwordError ? styles.inputError : null]}
        placeholder="Password"
        value={password}
        onChangeText={(text) => { setPassword(text); setPasswordError(''); }}
        secureTextEntry
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

      <Link href="/signup" style={styles.link}>
        Don't have an account? Sign up
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginBottom: 12,
    marginTop: -8,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: '#2563eb',
  },
});