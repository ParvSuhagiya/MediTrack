import { useState, useContext, useCallback } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import { ThemeContext } from '../../context/ThemeContext';
import { API_URL } from '../../constants/api';
import { Colors } from '../../constants/colors';

export default function Schedule() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const { theme } = useContext(ThemeContext);
  const router = useRouter();
  const colors = Colors[theme] || Colors.light;

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
      showToast(`Dose marked as ${status}`);
      fetchSchedule();
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.detail, { color: colors.textSecondary }]}>{item.dosage} · {item.time}</Text>

      {item.log ? (
        <View style={[styles.statusBadge, { backgroundColor: colors.border }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>
            {item.log.status.charAt(0).toUpperCase() + item.log.status.slice(1)}
          </Text>
        </View>
      ) : (
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.takenButton, { backgroundColor: colors.success }]}
            onPress={() => router.push({ pathname: '/mark-taken', params: { id: item._id, name: item.name } })}
          >
            <Text style={styles.buttonText}>Taken</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.skipButton, { backgroundColor: colors.textSecondary }]} onPress={() => markLog(item._id, 'skipped')}>
            <Text style={styles.buttonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.missButton, { backgroundColor: colors.danger }]} onPress={() => markLog(item._id, 'missed')}>
            <Text style={styles.buttonText}>Miss</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionHeader, { color: colors.text, backgroundColor: colors.border }]}>{title}</Text>
        )}
        refreshing={loading}
        onRefresh={fetchSchedule}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.empty}>No schedule for today</Text>
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
  },
  missButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
});
