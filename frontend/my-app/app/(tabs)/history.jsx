import { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, Modal, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { API_URL } from '../../constants/api';
import { Colors } from '../../constants/colors';

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
  const { theme } = useContext(ThemeContext);
  const colors = Colors[theme] || Colors.light;

const fetchData = async () => {
  setLoading(true);
  try {
    const [logsRes, medsRes] = await Promise.all([
      fetch(`${API_URL}/doselogs`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_URL}/medicines`, { headers: { Authorization: `Bearer ${token}` } })
    ]);
    const logsData = await logsRes.json();
    const medsData = await medsRes.json();

    setLogs(Array.isArray(logsData) ? logsData : []);
    setMedicines(Array.isArray(medsData) ? medsData : []);

    if (!logsRes.ok || !medsRes.ok) {
      Alert.alert('Error', logsData.message || medsData.message || 'Could not load history');
    }
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
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.name, { color: colors.text }]}>{item.medicine?.name}</Text>
            <Text style={[styles.detail, { color: colors.textSecondary }]}>{dateStr} at {timeStr}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.border }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.statsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.statsText, { color: colors.primary }]}>Adherence Rate: {adherence}%</Text>
        <Text style={[styles.statsSubtext, { color: colors.textSecondary }]}>{takenLogs} / {totalLogs} doses taken</Text>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medFilters}>
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: colors.border }, selectedMed === '' && { backgroundColor: colors.primary }]}
            onPress={() => setSelectedMed('')}
          >
            <Text style={[styles.filterChipText, { color: colors.text }, selectedMed === '' && { color: '#fff' }]}>All</Text>
          </TouchableOpacity>
          {medicines.map(med => (
            <TouchableOpacity
              key={med._id}
              style={[styles.filterChip, { backgroundColor: colors.border }, selectedMed === med._id && { backgroundColor: colors.primary }]}
              onPress={() => setSelectedMed(med._id)}
            >
              <Text style={[styles.filterChipText, { color: colors.text }, selectedMed === med._id && { color: '#fff' }]}>{med.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TextInput
          style={[styles.dateInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          placeholder="Filter by Date (YYYY-MM-DD)"
          placeholderTextColor={colors.textSecondary}
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
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
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
    paddingTop: 60,
  },
  statsContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  statsText: {
    fontSize: 28,
    fontWeight: '800',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detail: {
    marginTop: 4,
    fontSize: 14,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
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
