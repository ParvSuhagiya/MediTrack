import { useContext, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';

const API_URL = 'http://YOUR_LOCAL_IP:5000/api/medicines';

export default function Medicines() {
  const { token } = useContext(AuthContext);
  const [medicines, setMedicines] = useState([]);
  const router = useRouter();

  const fetchMedicines = async () => {
    const response = await fetch(API_URL, {
      headers: { Authorization: 'Bearer ' + token },
    });
    const data = await response.json();
    setMedicines(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchMedicines();
    }, [])
  );

  const handleDelete = async (id) => {
    await fetch(API_URL + '/' + id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token },
    });
    fetchMedicines();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-medicine')}>
        <Text style={styles.addButtonText}>+ Add Medicine</Text>
      </TouchableOpacity>

      <FlatList
        data={medicines}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.dosage} - {item.frequency}</Text>
            <Text>Time: {item.time}</Text>
            <TouchableOpacity onPress={() => handleDelete(item._id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No medicines added yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  addButton: { backgroundColor: '#007bff', padding: 12, borderRadius: 5, marginBottom: 15 },
  addButtonText: { color: '#fff', textAlign: 'center' },
  card: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 15, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: 'bold' },
  deleteText: { color: 'red', marginTop: 10 },
  empty: { textAlign: 'center', marginTop: 20, color: '#888' },
});