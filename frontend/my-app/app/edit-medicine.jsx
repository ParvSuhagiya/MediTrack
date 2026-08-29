import { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../constants/api';

export default function EditMedicine() {
  const params = useLocalSearchParams();

  const [name, setName] = useState(params.name || '');
  const [dosage, setDosage] = useState(params.dosage || '');
  const [frequency, setFrequency] = useState(params.frequency || '');
  const [time, setTime] = useState(params.time || '');
  const [loading, setLoading] = useState(false);

  const { token } = useContext(AuthContext);
  const router = useRouter();

  const handleUpdate = async () => {
    if (!name || !dosage || !frequency || !time) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/medicines/${params.id}`, {
        method: 'PUT',
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

      router.back();
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Medicine</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Dosage (e.g. 500mg)"
        value={dosage}
        onChangeText={setDosage}
      />

      <TextInput
        style={styles.input}
        placeholder="Frequency (e.g. Twice a day)"
        value={frequency}
        onChangeText={setFrequency}
      />

      <TextInput
        style={styles.input}
        placeholder="Time (e.g. 9:00 AM)"
        value={time}
        onChangeText={setTime}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Medicine'}</Text>
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