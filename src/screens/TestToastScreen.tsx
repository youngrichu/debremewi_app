import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useToast } from 'react-native-toast-notifications';

const TestToastScreen = () => {
  const toast = useToast();

  const showToast = () => {
    console.log('Show toast button pressed');
    toast.show("This is a test message", {
      type: "success",
      placement: "bottom",
      duration: 4000,
      animationType: "slide-in",
    });
  };

  return (
    <View style={styles.container}>
      <Button title="Show Toast" onPress={showToast} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TestToastScreen; 