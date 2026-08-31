import { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const router = useRouter();

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

  const isDark = theme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Welcome, {user?.name}</Text>
      <Text style={[styles.subtitle, { color: isDark ? '#aaa' : '#666' }]}>{user?.email}</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
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
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});