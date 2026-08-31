import { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { API_URL } from '../constants/api';

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
  const router = useRouter();

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Medicine</Text>

      <TextInput
        style={[styles.input, nameError ? styles.inputError : null]}
        placeholder="Name"
        value={name}
        onChangeText={(text) => { setName(text); setNameError(''); }}
      />
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

      <TextInput
        style={[styles.input, dosageError ? styles.inputError : null]}
        placeholder="Dosage (e.g. 500mg)"
        value={dosage}
        onChangeText={(text) => { setDosage(text); setDosageError(''); }}
      />
      {dosageError ? <Text style={styles.errorText}>{dosageError}</Text> : null}

      <TextInput
        style={[styles.input, frequencyError ? styles.inputError : null]}
        placeholder="Frequency (e.g. Twice a day)"
        value={frequency}
        onChangeText={(text) => { setFrequency(text); setFrequencyError(''); }}
      />
      {frequencyError ? <Text style={styles.errorText}>{frequencyError}</Text> : null}

      <TextInput
        style={[styles.input, timeError ? styles.inputError : null]}
        placeholder="Time (e.g. 9:00 AM)"
        value={time}
        onChangeText={(text) => { setTime(text); setTimeError(''); }}
      />
      {timeError ? <Text style={styles.errorText}>{timeError}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleAdd} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Medicine'}</Text>
      </TouchableOpacity>
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
    fontSize: 24,
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
});