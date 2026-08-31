import { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { API_URL } from '../../constants/api';

export default function Profile() {
  const { user, token, updateUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const isDark = theme === 'dark';

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (response.ok) {
        updateUser(data);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/users/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        Alert.alert('Success', 'Password updated successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to update password');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#f5f5f5',
      padding: 24,
    },
    text: {
      color: isDark ? '#fff' : '#000',
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: isDark ? '#333' : '#fff',
      color: isDark ? '#fff' : '#000',
      borderColor: isDark ? '#555' : '#ccc',
    }
  ];

  return (
    <ScrollView style={dynamicStyles.container}>
      <Text style={[styles.sectionTitle, dynamicStyles.text]}>Edit Profile</Text>
      <TextInput
        style={inputStyle}
        placeholder="Name"
        placeholderTextColor={isDark ? '#aaa' : '#666'}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={inputStyle}
        placeholder="Email"
        placeholderTextColor={isDark ? '#aaa' : '#666'}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={[styles.sectionTitle, dynamicStyles.text]}>Change Password</Text>
      <TextInput
        style={inputStyle}
        placeholder="Current Password"
        placeholderTextColor={isDark ? '#aaa' : '#666'}
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <TextInput
        style={inputStyle}
        placeholder="New Password"
        placeholderTextColor={isDark ? '#aaa' : '#666'}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={inputStyle}
        placeholder="Confirm New Password"
        placeholderTextColor={isDark ? '#aaa' : '#666'}
        secureTextEntry
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={styles.themeRow}>
        <Text style={[styles.themeText, dynamicStyles.text]}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 16,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  themeText: {
    fontSize: 18,
  }
});
