import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { login, register } from '../store/authSlice';
import { useNavigation } from '@react-navigation/native';

const AuthScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const dispatch = useDispatch();
  const { error: authError, token, loading } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation();
  const [error, setError] = useState<string | null>(null);

  const validateForm = (isLogin: boolean): boolean => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }
    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    setError(null);
    return true;
  };

  const handleAuth = () => {
    if (validateForm(isLogin)) {
      if (isLogin) {
        dispatch(login({ username, password }));
      } else {
        dispatch(register({ username, password }));
      }
    }
  };

  useEffect(() => {
    if (token) {
      navigation.navigate('Landing');
    }
  }, [token, navigation]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <View style={styles.container}>
      <Text>{isLogin ? 'Login' : 'Register'}</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      {(error || authError) && <Text style={styles.errorText}>{error || authError}</Text>}
      <Button title={loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')} onPress={handleAuth} disabled={loading} />
      <TouchableOpacity onPress={toggleAuthMode}>
        <Text style={styles.switchText}>{isLogin ? "Don't have an account? Register" : "Already have an account? Login"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  switchText: {
    marginTop: 10,
    color: 'blue',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default AuthScreen;
