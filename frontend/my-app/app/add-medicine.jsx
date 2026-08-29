import { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://YOUR_LOCAL_IP:5000/api/medicines';

export default function AddMedicine() {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [time, setTime] = useState('');
  const { token } = useContext(AuthContext);
  const router = useRouter();

  const handleAdd = async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ name, dosage, frequency, time }),
    });

    if (response.ok) {
      router.back();
    } else {
      Alert.alert('Error', 'Could not add medicine');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Medicine</Text>

      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Dosage (e.g. 500mg)" value={dosage} onChangeText={setDosage} />
      <TextInput style={styles.input} placeholder="Frequency (e.g. Twice a day)" value={frequency} onChangeText={setFrequency} />
      <TextInput style={styles.input} placeholder="Time (e.g. 9:00 AM)" value={time} onChangeText={setTime} />

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 5 },
  buttonText: { color: '#fff', textAlign: 'center' },
});