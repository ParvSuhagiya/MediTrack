import { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../constants/api';

export default function AddAppointment() {
  const [doctor, setDoctor] = useState('');
  const [clinic, setClinic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { token } = useContext(AuthContext);
  const router = useRouter();

  const handleAdd = async () => {
    if (!doctor || !clinic || !date || !time) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ doctor, clinic, date, time, notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message);
        return;
      }

      router.back();
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Appointment</Text>

      <TextInput
        style={styles.input}
        placeholder="Doctor Name"
        value={doctor}
        onChangeText={setDoctor}
      />

      <TextInput
        style={styles.input}
        placeholder="Clinic"
        value={clinic}
        onChangeText={setClinic}
      />

      <TextInput
        style={styles.input}
        placeholder="Date (e.g. 2024-12-01)"
        value={date}
        onChangeText={setDate}
      />

      <TextInput
        style={styles.input}
        placeholder="Time (e.g. 10:00 AM)"
        value={time}
        onChangeText={setTime}
      />

      <TextInput
        style={styles.input}
        placeholder="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity style={styles.button} onPress={handleAdd} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Appointment'}</Text>
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
