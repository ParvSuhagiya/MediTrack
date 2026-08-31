import { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Linking, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import { API_URL } from '../../constants/api';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const router = useRouter();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load appointments');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await fetch(`${API_URL}/appointments/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              showToast('Appointment deleted');
              fetchAppointments();
            } catch (err) {
              Alert.alert('Error', 'Could not delete appointment');
            }
          }
        }
      ]
    );
  };

  const handleToggleComplete = async (appointment) => {
    try {
      await fetch(`${API_URL}/appointments/${appointment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !appointment.completed }),
      });
      showToast(!appointment.completed ? 'Appointment marked complete' : 'Appointment marked incomplete');
      fetchAppointments();
    } catch (err) {
      Alert.alert('Error', 'Could not update appointment');
    }
  };

  const handleOpenMap = (lat, lng) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open map');
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={[styles.name, item.completed && styles.completedText]}>{item.doctor}</Text>
      <Text style={styles.detail}>{item.clinic} · {item.date} · {item.time}</Text>
      {item.address ? <Text style={styles.address}>📍 {item.address}</Text> : null}
      {item.notes ? <Text style={styles.notes}>Notes: {item.notes}</Text> : null}

      <View style={styles.row}>
        {item.latitude && item.longitude ? (
          <TouchableOpacity style={styles.mapButton} onPress={() => handleOpenMap(item.latitude, item.longitude)}>
            <Text style={styles.buttonText}>Map</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={item.completed ? styles.completedButton : styles.completeButton}
          onPress={() => handleToggleComplete(item)}
        >
          <Text style={styles.buttonText}>{item.completed ? 'Completed' : 'Complete'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push({ pathname: '/edit-appointment', params: { id: item._id, doctor: item.doctor, clinic: item.clinic, date: item.date, time: item.time, notes: item.notes, address: item.address, latitude: item.latitude, longitude: item.longitude } })}
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
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-appointment')}>
        <Text style={styles.addButtonText}>+ Add Appointment</Text>
      </TouchableOpacity>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchAppointments}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.empty}>No appointments added yet</Text>
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
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  detail: {
    color: '#666',
    marginTop: 4,
    marginBottom: 6,
  },
  address: {
    color: '#333',
    fontSize: 13,
    marginBottom: 4,
  },
  notes: {
    color: '#444',
    fontStyle: 'italic',
    marginBottom: 10,
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  mapButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  completeButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  completedButton: {
    backgroundColor: '#6b7280',
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
