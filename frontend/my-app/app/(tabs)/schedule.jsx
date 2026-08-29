import { useState, useContext, useCallback } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../constants/api';

export default function Schedule() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token } = useContext(AuthContext);
  const router = useRouter();

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [medicinesRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/medicines`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/doselogs?date=${today}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const medicines = await medicinesRes.json();
      const logs = await logsRes.json();

      const morning = [];
      const afternoon = [];
      const night = [];

      medicines.forEach(med => {
        // Find if already logged today
        const log = logs.find(l => l.medicine._id === med._id || l.medicine === med._id);
        const medWithLog = { ...med, log };

        // Parse time to group
        const timeStr = med.time.toUpperCase();
        let hour = parseInt(timeStr.split(':')[0], 10);
        const isPM = timeStr.includes('PM');

        if (isPM && hour !== 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;

        if (hour < 12) {
          morning.push(medWithLog);
        } else if (hour < 17) {
          afternoon.push(medWithLog);
        } else {
          night.push(medWithLog);
        }
      });

      const newSections = [];
      if (morning.length > 0) newSections.push({ title: 'Morning', data: morning });
      if (afternoon.length > 0) newSections.push({ title: 'Afternoon', data: afternoon });
      if (night.length > 0) newSections.push({ title: 'Night', data: night });

      setSections(newSections);
    } catch (err) {
      Alert.alert('Error', 'Could not load schedule');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSchedule();
    }, [])
  );

  const markLog = async (medicineId, status) => {
    try {
      const response = await fetch(`${API_URL}/doselogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ medicineId, status }),
      });

      if (!response.ok) {
        Alert.alert('Error', 'Could not save log');
        return;
      }
      fetchSchedule();
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.detail}>{item.dosage} · {item.time}</Text>

      {item.log ? (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {item.log.status.charAt(0).toUpperCase() + item.log.status.slice(1)}
          </Text>
        </View>
      ) : (
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.takenButton}
            onPress={() => router.push({ pathname: '/mark-taken', params: { id: item._id, name: item.name } })}
          >
            <Text style={styles.buttonText}>Taken</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={() => markLog(item._id, 'skipped')}>
            <Text style={styles.buttonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.missButton} onPress={() => markLog(item._id, 'missed')}>
            <Text style={styles.buttonText}>Miss</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        refreshing={loading}
        onRefresh={fetchSchedule}
        ListEmptyComponent={<Text style={styles.empty}>No schedule for today</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#f2f2f2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
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
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
  },
  skipButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
  },
  missButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusBadge: {
    backgroundColor: '#e5e7eb',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontWeight: 'bold',
    color: '#374151',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
});
