import { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { API_URL } from '../constants/api';

export default function EditAppointment() {
  const params = useLocalSearchParams();

  const [doctor, setDoctor] = useState(params.doctor || '');
  const [clinic, setClinic] = useState(params.clinic || '');
  const [date, setDate] = useState(params.date || '');
  const [time, setTime] = useState(params.time || '');
  const [notes, setNotes] = useState(params.notes || '');
  const [address, setAddress] = useState(params.address || '');
  const [latitude, setLatitude] = useState(params.latitude ? parseFloat(params.latitude) : null);
  const [longitude, setLongitude] = useState(params.longitude ? parseFloat(params.longitude) : null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [doctorError, setDoctorError] = useState('');
  const [clinicError, setClinicError] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  const { token } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const router = useRouter();

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

  const handleUpdate = async () => {
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
      const response = await fetch(`${API_URL}/appointments/${params.id}`, {
        method: 'PUT',
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

      showToast('Appointment updated');
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Appointment</Text>

      <TextInput
        style={[styles.input, doctorError ? styles.inputError : null]}
        placeholder="Doctor Name"
        value={doctor}
        onChangeText={(text) => { setDoctor(text); setDoctorError(''); }}
      />
      {doctorError ? <Text style={styles.errorText}>{doctorError}</Text> : null}

      <TextInput
        style={[styles.input, clinicError ? styles.inputError : null]}
        placeholder="Clinic Name"
        value={clinic}
        onChangeText={(text) => { setClinic(text); setClinicError(''); }}
      />
      {clinicError ? <Text style={styles.errorText}>{clinicError}</Text> : null}

      <TextInput
        style={[styles.input, dateError ? styles.inputError : null]}
        placeholder="Date (e.g. 2024-12-01)"
        value={date}
        onChangeText={(text) => { setDate(text); setDateError(''); }}
      />
      {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

      <TextInput
        style={[styles.input, timeError ? styles.inputError : null]}
        placeholder="Time (e.g. 10:00 AM)"
        value={time}
        onChangeText={(text) => { setTime(text); setTimeError(''); }}
      />
      {timeError ? <Text style={styles.errorText}>{timeError}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
      />

      <View style={styles.locationContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Clinic Address (optional)"
          value={address}
          onChangeText={setAddress}
        />
        <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation} disabled={locationLoading}>
          <Text style={styles.locationButtonText}>{locationLoading ? 'Locating...' : 'Use Current'}</Text>
        </TouchableOpacity>
      </View>
      {permissionDenied ? (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Location access denied</Text>
          <TouchableOpacity onPress={handleGetLocation}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Appointment'}</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
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
    backgroundColor: '#059669',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  permissionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  permissionText: {
    color: '#dc2626',
    fontSize: 12,
  },
  retryText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
