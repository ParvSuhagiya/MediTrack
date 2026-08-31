import { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, Modal, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../constants/api';

export default function History() {
  const [logs, setLogs] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMed, setSelectedMed] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Modal state
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const { token } = useContext(AuthContext);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, medsRes] = await Promise.all([
        fetch(`${API_URL}/doselogs`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/medicines`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const logsData = await logsRes.json();
      const medsData = await medsRes.json();
      
      setLogs(logsData);
      setMedicines(medsData);
    } catch (err) {
      Alert.alert('Error', 'Could not load history');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Client-side filtering
  const filteredLogs = logs.filter(log => {
    let matchMed = true;
    let matchDate = true;

    if (selectedMed) {
      matchMed = log.medicine?._id === selectedMed;
    }

    if (selectedDate) {
      const logDate = new Date(log.takenAt).toISOString().split('T')[0];
      matchDate = logDate === selectedDate;
    }

    return matchMed && matchDate;
  });

  const totalLogs = filteredLogs.length;
  const takenLogs = filteredLogs.filter(l => l.status === 'taken').length;
  const adherence = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 0;

  const renderItem = ({ item }) => {
    const dateObj = new Date(item.takenAt);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString();

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.name}>{item.medicine?.name}</Text>
            <Text style={styles.detail}>{dateStr} at {timeStr}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        {item.photo && (
          <TouchableOpacity onPress={() => setSelectedPhoto(item.photo)}>
            <Image source={{ uri: item.photo }} style={styles.thumbnail} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Adherence Rate: {adherence}%</Text>
        <Text style={styles.statsSubtext}>{takenLogs} / {totalLogs} doses taken</Text>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medFilters}>
          <TouchableOpacity
            style={[styles.filterChip, selectedMed === '' && styles.filterChipActive]}
            onPress={() => setSelectedMed('')}
          >
            <Text style={[styles.filterChipText, selectedMed === '' && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
          {medicines.map(med => (
            <TouchableOpacity
              key={med._id}
              style={[styles.filterChip, selectedMed === med._id && styles.filterChipActive]}
              onPress={() => setSelectedMed(med._id)}
            >
              <Text style={[styles.filterChipText, selectedMed === med._id && styles.filterChipTextActive]}>{med.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TextInput
          style={styles.dateInput}
          placeholder="Filter by Date (YYYY-MM-DD)"
          value={selectedDate}
          onChangeText={setSelectedDate}
        />
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchData}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.empty}>No dose logs found</Text>
          )
        }
      />

      <Modal visible={!!selectedPhoto} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedPhoto(null)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
          {selectedPhoto && (
            <Image source={{ uri: selectedPhoto }} style={styles.fullImage} resizeMode="contain" />
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
    backgroundColor: '#f9fafb',
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statsSubtext: {
    color: '#666',
    marginTop: 4,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  medFilters: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 14,
    color: '#374151',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detail: {
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontWeight: 'bold',
    color: '#374151',
    fontSize: 12,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 12,
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});
