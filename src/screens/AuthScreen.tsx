import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function AuthScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Welcome to the Auth Screen</Text>
      <Button title="Login" onPress={() => navigation.navigate('Login')} />
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
