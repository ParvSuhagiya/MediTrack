import { useState, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../constants/api';

export default function MarkTaken() {
  const { id, name } = useLocalSearchParams();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const { token } = useContext(AuthContext);
  const router = useRouter();

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera access is required to take a photo');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
  };

  const submitPhoto = async () => {
    if (!photo) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/doselogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicineId: id,
          status: 'taken',
          photo: `data:image/jpeg;base64,${photo.base64}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message);
        return;
      }

      Alert.alert('Success', 'Dose marked as taken');
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mark "{name}" as taken</Text>

      {photo ? (
        <>
          <Image source={{ uri: photo.uri }} style={styles.preview} />

          <TouchableOpacity style={styles.buttonOutline} onPress={retakePhoto}>
            <Text style={styles.buttonOutlineText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={submitPhoto} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Confirm & Save'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={styles.button} onPress={openCamera}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  preview: {
    width: 250,
    height: 250,
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 12,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 12,
    width: '100%',
  },
  buttonOutlineText: {
    color: '#2563eb',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});