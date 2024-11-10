import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { AppDispatch } from '../store';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('Validation Error', 'Username is required');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Password is required');
      return;
    }

    try {
      setLoading(true);
      const result = await dispatch(login({ username, password })).unwrap();
      
      if (result.token) {
        // No need to manually navigate - AppNavigator will handle this
        // based on the authentication state
        console.log('Login successful');
      }
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'An error occurred during login'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={username}
        onChangeText={setUsername}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <View style={styles.links}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')}
          disabled={loading}
        >
          <Text style={styles.linkText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ForgotPassword')}
          disabled={loading}
        >
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  links: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkText: {
    color: '#2196F3',
    fontSize: 16,
  },
});
