import { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../constants/api';

export default function EditAppointment() {
  const params = useLocalSearchParams();

  const [doctor, setDoctor] = useState(params.doctor || '');
  const [clinic, setClinic] = useState(params.clinic || '');
  const [date, setDate] = useState(params.date || '');
  const [time, setTime] = useState(params.time || '');
  const [notes, setNotes] = useState(params.notes || '');
  const [loading, setLoading] = useState(false);

  const { token } = useContext(AuthContext);
  const router = useRouter();

  const handleUpdate = async () => {
    if (!doctor || !clinic || !date || !time) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/appointments/${params.id}`, {
        method: 'PUT',
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
      <Text style={styles.title}>Edit Appointment</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Appointment'}</Text>
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
