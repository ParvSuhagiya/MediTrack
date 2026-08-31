import { useEffect, useRef, useContext } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { ToastContext } from '../context/ToastContext';

export default function Toast() {
  const { toastMessage, hideToast } = useContext(ToastContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toastMessage) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        hideToast();
      });
    }
  }, [toastMessage, fadeAnim, hideToast]);

  if (!toastMessage) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
        <Text style={styles.text}>{toastMessage}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '80%',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
