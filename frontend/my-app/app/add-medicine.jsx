import { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { ThemeContext } from '../context/ThemeContext';
import { API_URL } from '../constants/api';
import { Colors } from '../constants/colors';

export default function AddMedicine() {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [dosageError, setDosageError] = useState('');
  const [frequencyError, setFrequencyError] = useState('');
  const [timeError, setTimeError] = useState('');

  const { token } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const { theme } = useContext(ThemeContext);
  const router = useRouter();
  const colors = Colors[theme] || Colors.light;

  const handleAdd = async () => {
    let valid = true;
    setNameError('');
    setDosageError('');
    setFrequencyError('');
    setTimeError('');

    if (!name) { setNameError('Name is required'); valid = false; }
    if (!dosage) { setDosageError('Dosage is required'); valid = false; }
    if (!frequency) { setFrequencyError('Frequency is required'); valid = false; }
    if (!time) { setTimeError('Time is required'); valid = false; }

    if (!valid) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/medicines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, dosage, frequency, time }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message);
        return;
      }

      showToast('Medicine added');
      router.back();
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
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Add Medicine</Text>

      <TextInput
        style={getInputStyle(nameError)}
        placeholder="Name"
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={(text) => { setName(text); setNameError(''); }}
      />
      {nameError ? <Text style={[styles.errorText, { color: colors.danger }]}>{nameError}</Text> : null}

      <TextInput
        style={getInputStyle(dosageError)}
        placeholder="Dosage (e.g. 500mg)"
        placeholderTextColor={colors.textSecondary}
        value={dosage}
        onChangeText={(text) => { setDosage(text); setDosageError(''); }}
      />
      {dosageError ? <Text style={[styles.errorText, { color: colors.danger }]}>{dosageError}</Text> : null}

      <TextInput
        style={getInputStyle(frequencyError)}
        placeholder="Frequency (e.g. Twice a day)"
        placeholderTextColor={colors.textSecondary}
        value={frequency}
        onChangeText={(text) => { setFrequency(text); setFrequencyError(''); }}
      />
      {frequencyError ? <Text style={[styles.errorText, { color: colors.danger }]}>{frequencyError}</Text> : null}

      <TextInput
        style={getInputStyle(timeError)}
        placeholder="Time (e.g. 9:00 AM)"
        placeholderTextColor={colors.textSecondary}
        value={time}
        onChangeText={(text) => { setTime(text); setTimeError(''); }}
      />
      {timeError ? <Text style={[styles.errorText, { color: colors.danger }]}>{timeError}</Text> : null}

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleAdd} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Medicine'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
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
});