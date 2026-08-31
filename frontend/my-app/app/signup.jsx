import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { ThemeContext } from '../context/ThemeContext';
import { useContext } from 'react';
import { API_URL } from '../constants/api';
import { Colors } from '../constants/colors';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { theme } = useContext(ThemeContext);
  const router = useRouter();
  const colors = Colors[theme] || Colors.light;

  const handleSignup = async () => {
    let valid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');

    if (!name) {
      setNameError('Name is required');
      valid = false;
    }

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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    if (!valid) {
      Alert.alert('Error', 'Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Signup failed', data.message);
        return;
      }

      Alert.alert('Success', 'Account created, please login');
      router.replace('/login');
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (hasError) => [
    styles.input,
    {
      backgroundColor: colors.surface,
      color: colors.text,
      borderColor: hasError ? colors.danger : colors.border,
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Sign Up</Text>

      <TextInput
        style={getInputStyle(nameError)}
        placeholder="Name"
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={(text) => { setName(text); setNameError(''); }}
      />
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

      <TextInput
        style={getInputStyle(emailError)}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={(text) => { setEmail(text); setEmailError(''); }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <TextInput
        style={getInputStyle(passwordError)}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={(text) => { setPassword(text); setPasswordError(''); }}
        secureTextEntry
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <Link href="/login" style={[styles.link, { color: colors.primary }]}>
        Already have an account? Login
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
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  errorText: {
    color: Colors.light.danger,
    fontSize: 12,
    marginBottom: 12,
    marginTop: -8,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    marginTop: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
});