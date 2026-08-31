import { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { ThemeContext } from '../context/ThemeContext';
import { API_URL } from '../constants/api';
import { Colors } from '../constants/colors';

export default function AddAppointment() {
  const [doctor, setDoctor] = useState('');
  const [clinic, setClinic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [doctorError, setDoctorError] = useState('');
  const [clinicError, setClinicError] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  const { token } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const { theme } = useContext(ThemeContext);
  const router = useRouter();
  const colors = Colors[theme] || Colors.light;

  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        const fullAddress = `${place.name || place.street || ''} ${place.city || ''}, ${place.region || ''}`.trim();
        setAddress(fullAddress);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get current location');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleAdd = async () => {
    let valid = true;
    setDoctorError('');
    setClinicError('');
    setDateError('');
    setTimeError('');

    if (!doctor) { setDoctorError('Doctor is required'); valid = false; }
    if (!clinic) { setClinicError('Clinic is required'); valid = false; }
    if (!date) { setDateError('Date is required'); valid = false; }
    if (!time) { setTimeError('Time is required'); valid = false; }

    if (!valid) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ doctor, clinic, date, time, notes, address, latitude, longitude }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message);
        return;
      }

      showToast('Appointment added');
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (hasError) => [
    styles.input,
    {
      backgroundColor: colors.surface,
      color: colors.text,
      borderColor: hasError ? colors.danger : colors.border,
    }
  ];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Add Appointment</Text>

      <TextInput
        style={getInputStyle(doctorError)}
        placeholder="Doctor Name"
        placeholderTextColor={colors.textSecondary}
        value={doctor}
        onChangeText={(text) => { setDoctor(text); setDoctorError(''); }}
      />
      {doctorError ? <Text style={[styles.errorText, { color: colors.danger }]}>{doctorError}</Text> : null}

      <TextInput
        style={getInputStyle(clinicError)}
        placeholder="Clinic Name"
        placeholderTextColor={colors.textSecondary}
        value={clinic}
        onChangeText={(text) => { setClinic(text); setClinicError(''); }}
      />
      {clinicError ? <Text style={[styles.errorText, { color: colors.danger }]}>{clinicError}</Text> : null}

      <TextInput
        style={getInputStyle(dateError)}
        placeholder="Date (e.g. 2024-12-01)"
        placeholderTextColor={colors.textSecondary}
        value={date}
        onChangeText={(text) => { setDate(text); setDateError(''); }}
      />
      {dateError ? <Text style={[styles.errorText, { color: colors.danger }]}>{dateError}</Text> : null}

      <TextInput
        style={getInputStyle(timeError)}
        placeholder="Time (e.g. 10:00 AM)"
        placeholderTextColor={colors.textSecondary}
        value={time}
        onChangeText={(text) => { setTime(text); setTimeError(''); }}
      />
      {timeError ? <Text style={[styles.errorText, { color: colors.danger }]}>{timeError}</Text> : null}

      <TextInput
        style={getInputStyle(false)}
        placeholder="Notes (optional)"
        placeholderTextColor={colors.textSecondary}
        value={notes}
        onChangeText={setNotes}
      />

      <View style={styles.locationContainer}>
        <TextInput
          style={[getInputStyle(false), { flex: 1, marginBottom: 0 }]}
          placeholder="Clinic Address (optional)"
          placeholderTextColor={colors.textSecondary}
          value={address}
          onChangeText={setAddress}
        />
        <TouchableOpacity
          style={[styles.locationButton, { backgroundColor: colors.success }]}
          onPress={handleGetLocation}
          disabled={locationLoading}
        >
          <Text style={styles.locationButtonText}>{locationLoading ? 'Locating...' : 'Use Current'}</Text>
        </TouchableOpacity>
      </View>

      {permissionDenied ? (
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionText, { color: colors.danger }]}>Location access denied</Text>
          <TouchableOpacity onPress={handleGetLocation}>
            <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleAdd} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Appointment'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 12,
    marginTop: -8,
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'stretch',
  },
  locationButton: {
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  permissionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 12,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
