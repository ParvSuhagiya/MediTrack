import { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { ToastContext } from '../../context/ToastContext';
import { API_URL } from '../../constants/api';
import { Colors } from '../../constants/colors';

export default function Profile() {
  const { user, token, updateUser, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const colors = Colors[theme] || Colors.light;
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('');

  const { showToast } = useContext(ToastContext);

  const isDark = theme === 'dark';

  const handleUpdateProfile = async () => {
    let valid = true;
    setNameError('');
    setEmailError('');

    if (!name) { setNameError('Name is required'); valid = false; }
    if (!email) { 
      setEmailError('Email is required'); 
      valid = false; 
    } else if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Invalid email format');
      valid = false;
    }

    if (!valid) {
      Alert.alert('Error', 'Please fix the errors below');
      return;
    }

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
        showToast('Profile updated successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    }
  };

  const handleUpdatePassword = async () => {
    let valid = true;
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmNewPasswordError('');

    if (!currentPassword) { setCurrentPasswordError('Current password is required'); valid = false; }
    
    if (!newPassword) { 
      setNewPasswordError('New password is required'); 
      valid = false; 
    } else if (newPassword.length < 6) {
      setNewPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError('Passwords do not match');
      valid = false;
    }

    if (!valid) {
      Alert.alert('Error', 'Please fix the errors below');
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
        showToast('Password updated successfully');
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
      backgroundColor: colors.background,
      padding: 24,
    },
    text: {
      color: colors.text,
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => {
            logout();
            router.replace('/login');
          }
        }
      ]
    );
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
    <ScrollView style={dynamicStyles.container}>
      <Text style={[styles.sectionTitle, dynamicStyles.text]}>Edit Profile</Text>
      <TextInput
        style={getInputStyle(nameError)}
        placeholder="Name"
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={(text) => { setName(text); setNameError(''); }}
      />
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
      
      <TextInput
        style={getInputStyle(emailError)}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={(text) => { setEmail(text); setEmailError(''); }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={[styles.sectionTitle, dynamicStyles.text]}>Change Password</Text>
      <TextInput
        style={getInputStyle(currentPasswordError)}
        placeholder="Current Password"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={currentPassword}
        onChangeText={(text) => { setCurrentPassword(text); setCurrentPasswordError(''); }}
      />
      {currentPasswordError ? <Text style={styles.errorText}>{currentPasswordError}</Text> : null}

      <TextInput
        style={getInputStyle(newPasswordError)}
        placeholder="New Password"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={newPassword}
        onChangeText={(text) => { setNewPassword(text); setNewPasswordError(''); }}
      />
      {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}

      <TextInput
        style={getInputStyle(confirmNewPasswordError)}
        placeholder="Confirm New Password"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={confirmNewPassword}
        onChangeText={(text) => { setConfirmNewPassword(text); setConfirmNewPasswordError(''); }}
      />
      {confirmNewPasswordError ? <Text style={styles.errorText}>{confirmNewPasswordError}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={styles.themeRow}>
        <Text style={[styles.themeText, dynamicStyles.text]}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
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
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginBottom: 12,
    marginTop: -12,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 24,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  themeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: Colors.light.danger,
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  logoutButtonText: {
    color: Colors.light.danger,
    fontWeight: '600',
    fontSize: 16,
  }
});
