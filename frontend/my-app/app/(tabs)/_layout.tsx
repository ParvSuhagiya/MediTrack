import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="medicines" options={{ title: 'Medicines' }} />
      <Tabs.Screen name="appointments" options={{ title: 'Appointments' }} />
    </Tabs>
  );
}