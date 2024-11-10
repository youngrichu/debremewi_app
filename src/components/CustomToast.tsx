import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Dimensions } from 'react-native';

interface CustomToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide?: () => void;
}

const { width } = Dimensions.get('window');

export const CustomToast: React.FC<CustomToastProps> = ({ 
  visible, 
  message, 
  type = 'success',
  onHide 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
        })
      ]).start(() => {
        if (onHide) onHide();
      });
    }
  }, [visible, fadeAnim, onHide]);

  if (!visible) return null;

  const backgroundColor = {
    success: '#4caf50',
    error: '#f44336',
    info: '#2196F3'
  }[type];

  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor, opacity: fadeAnim }
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: width * 0.1,
    right: width * 0.1,
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
}); 