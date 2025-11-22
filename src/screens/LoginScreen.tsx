import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { AuthService } from '../services/AuthService';
import { setUserData } from '../store/slices/userSlice';
import { setAuthState } from '../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IS_TABLET, getContainerWidth, getFontSize, wp, hp } from '../utils/responsive';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
  route: any;
}

const LoginScreen = ({ navigation, route }: LoginScreenProps) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState(route.params?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useTranslation();
  const scrollViewRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (route.params?.sessionExpired) {
      Alert.alert(
        t('auth.login.sessionExpired.title'),
        t('auth.login.sessionExpired.message'),
        [{ text: t('common.ok') }]
      );
    }
  }, [route.params?.sessionExpired]);

  const validateLogin = (identifier: string, password: string): string | null => {
    if (!identifier.trim()) return t('validation.required.emailOrUsername');
    // Removed strict email validation to allow usernames
    if (!password) return t('validation.required.password');
    if (password.length < 6) return t('validation.invalid.password.minLength');
    return null;
  };

  const handleLogin = async () => {
    const error = validateLogin(email, password);
    if (error) {
      setErrorMessage(error);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    console.log('Starting login process for:', email);

    try {
      console.log('Calling AuthService.login...');
      const response = await AuthService.login(email, password);
      console.log('AuthService.login returned:', response.success);
      console.log('Raw login response in LoginScreen:', JSON.stringify(response, null, 2));
      if (response.token) {
        await AsyncStorage.setItem('userToken', response.token);
        console.log('Token stored:', response.token);
      }

      if (response.success && response.token) {
        dispatch(setAuthState({
          isAuthenticated: true,
          token: response.token
        }));

        if (response.user) {
          console.log('Raw user data before dispatch:', JSON.stringify(response.user, null, 2));
          console.log('is_onboarding_complete value:', response.user.is_onboarding_complete);
          dispatch(setUserData(response.user));
        }
      } else {
        setErrorMessage(response.message || t('auth.login.errors.loginFailed'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(t('auth.login.errors.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <LinearGradient
        colors={['#2473E0', '#1E5BB8']}
        style={styles.gradient}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 20 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onLayout={() => {
            if (Platform.OS === 'android') {
              const keyboardDidShowListener = Keyboard.addListener(
                'keyboardDidShow',
                (e) => {
                  setKeyboardHeight(e.endCoordinates.height);
                }
              );
              const keyboardDidHideListener = Keyboard.addListener(
                'keyboardDidHide',
                () => {
                  setKeyboardHeight(0);
                }
              );

              return () => {
                keyboardDidShowListener.remove();
                keyboardDidHideListener.remove();
              };
            }
          }}
        >
          <View style={styles.headerSection}>
            <Text style={styles.welcomeText}>{t('auth.login.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>
          </View>

          <View style={[styles.formContainer, IS_TABLET && styles.tabletFormContainer]}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.login.placeholders.emailOrUsername')}
                placeholderTextColor="#666"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrorMessage('');
                }}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.login.placeholders.password')}
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessage('');
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>{t('auth.login.forgotPassword')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginButtonText}>{t('auth.login.loginButton')}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>{t('auth.login.noAccount')} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>{t('auth.login.register')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.8,
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#2473E0',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#2473E0',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#2473E0',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 4,
    textAlign: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#ccc',
  },
  // Tablet Styles
  tabletFormContainer: {
    width: getContainerWidth() as any,
    alignSelf: 'center',
    borderRadius: 30,
    paddingHorizontal: 40,
    paddingVertical: 40,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
});
export default LoginScreen;
