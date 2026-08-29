import { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../constants/api';

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token } = useContext(AuthContext);
  const router = useRouter();

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/medicines`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setMedicines(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load medicines');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMedicines();
    }, [])
  );

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/medicines/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMedicines();
    } catch (err) {
      Alert.alert('Error', 'Could not delete medicine');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.detail}>{item.dosage} · {item.frequency} · {item.time}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.takenButton}
          onPress={() => router.push({ pathname: '/mark-taken', params: { id: item._id, name: item.name } })}
        >
          <Text style={styles.buttonText}>Mark as Taken</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push({ pathname: '/edit-medicine', params: item })}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-medicine')}>
        <Text style={styles.addButtonText}>+ Add Medicine</Text>
      </TouchableOpacity>

      <FlatList
        data={medicines}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchMedicines}
        ListEmptyComponent={<Text style={styles.empty}>No medicines added yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detail: {
    color: '#666',
    marginTop: 4,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  takenButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
});