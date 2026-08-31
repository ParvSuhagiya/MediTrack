import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import Toast from '../components/Toast';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <Toast />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}