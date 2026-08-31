import { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import { ThemeContext } from '../../context/ThemeContext';
import { API_URL } from '../../constants/api';
import { Colors } from '../../constants/colors';

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const { theme } = useContext(ThemeContext);
  const router = useRouter();
  const colors = Colors[theme] || Colors.light;

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

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Medicine',
      'Are you sure you want to delete this medicine?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await fetch(`${API_URL}/medicines/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              showToast('Medicine deleted');
              fetchMedicines();
            } catch (err) {
              Alert.alert('Error', 'Could not delete medicine');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.detail, { color: colors.textSecondary }]}>{item.dosage} · {item.frequency} · {item.time}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.takenButton, { backgroundColor: colors.success }]}
          onPress={() => router.push({ pathname: '/mark-taken', params: { id: item._id, name: item.name } })}
        >
          <Text style={styles.buttonText}>Mark as Taken</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push({ pathname: '/edit-medicine', params: item })}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.danger }]} onPress={() => handleDelete(item._id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => router.push('/add-medicine')}>
        <Text style={styles.addButtonText}>+ Add Medicine</Text>
      </TouchableOpacity>

      <FlatList
        data={medicines}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchMedicines}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.empty}>No medicines added yet</Text>
          )
        }
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
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detail: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  takenButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 2,
    alignItems: 'center',
  },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
});