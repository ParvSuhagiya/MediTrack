import { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Linking, ActivityIndicator, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import { ThemeContext } from '../../context/ThemeContext';
import { API_URL } from '../../constants/api';
import { Colors } from '../../constants/colors';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapItem, setMapItem] = useState(null); // appointment to show on map

  const { token } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const { theme } = useContext(ThemeContext);
  const router = useRouter();
  const colors = Colors[theme] || Colors.light;

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

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.name, { color: colors.text }, item.completed && styles.completedText]}>
        {item.doctor}
      </Text>
      <Text style={[styles.detail, { color: colors.textSecondary }]}>{item.clinic} · {item.date} · {item.time}</Text>
      {item.address ? <Text style={[styles.address, { color: colors.textSecondary }]}>📍 {item.address}</Text> : null}
      {item.notes ? <Text style={[styles.notes, { color: colors.textSecondary }]}>Notes: {item.notes}</Text> : null}

      <View style={styles.row}>
        {item.latitude && item.longitude ? (
          <TouchableOpacity
            style={[styles.mapButton, { backgroundColor: colors.primary }]}
            onPress={() => setMapItem(item)}
          >
            <Text style={styles.buttonText}>Map</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: item.completed ? colors.textSecondary : colors.success }]}
          onPress={() => handleToggleComplete(item)}
        >
          <Text style={styles.buttonText}>{item.completed ? 'Completed' : 'Complete'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push({ pathname: '/edit-appointment', params: { id: item._id, doctor: item.doctor, clinic: item.clinic, date: item.date, time: item.time, notes: item.notes, address: item.address, latitude: item.latitude, longitude: item.longitude } })}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.danger }]} onPress={() => handleDelete(item._id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/add-appointment')}
      >
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
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <Text style={[styles.empty, { color: colors.textSecondary }]}>No appointments added yet</Text>
          )
        }
      />

      {/* Map Modal — shown only when Map button is pressed */}
      <Modal
        visible={!!mapItem}
        animationType="slide"
        onRequestClose={() => setMapItem(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{mapItem?.doctor}</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>{mapItem?.clinic}</Text>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.border }]}
              onPress={() => setMapItem(null)}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          {mapItem?.latitude && mapItem?.longitude ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: parseFloat(mapItem.latitude),
                longitude: parseFloat(mapItem.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: parseFloat(mapItem.latitude),
                  longitude: parseFloat(mapItem.longitude),
                }}
                title={mapItem.clinic}
                description={mapItem.address || mapItem.doctor}
              />
            </MapView>
          ) : (
            <View style={styles.noMap}>
              <Text style={[styles.noMapText, { color: colors.textSecondary }]}>No location data available</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
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
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  detail: {
    marginTop: 4,
    marginBottom: 6,
    fontSize: 14,
  },
  address: {
    fontSize: 13,
    marginBottom: 4,
  },
  notes: {
    fontStyle: 'italic',
    marginBottom: 10,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  mapButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  closeButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  map: {
    flex: 1,
  },
  noMap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMapText: {
    fontSize: 16,
  },
});
