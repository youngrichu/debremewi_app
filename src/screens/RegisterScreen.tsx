import React, { useState, useRef } from 'react';
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
import { AuthService } from '../services/AuthService';
import { useTranslation } from 'react-i18next';
import { setAuthState } from '../store/slices/authSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { IS_TABLET, getContainerWidth, getFontSize } from '../utils/responsive';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  submit?: string;
}

interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
}

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (data: FormData): FormErrors => {
    const errors: FormErrors = {};

    if (!data.firstName.trim()) errors.firstName = t('validation.required.firstName');
    if (!data.lastName.trim()) errors.lastName = t('validation.required.lastName');

    if (data.email.trim() && !/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = t('validation.invalid.email');
    }

    if (!data.password) {
      errors.password = t('validation.required.password');
    } else if (data.password.length < 6) {
      errors.password = t('validation.invalid.password.minLength');
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = t('validation.required.confirmPassword');
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = t('validation.invalid.password.mismatch');
    }

    return errors;
  };

  const handleRegister = async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      if (response.success) {
        // Store registration date if available
        if (response.user_registered) {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const { setRegistrationDate } = require('../store/slices/userSlice');
          const { store } = require('../store');

          await AsyncStorage.setItem('userRegistrationDate', response.user_registered);
          store.dispatch(setRegistrationDate(response.user_registered));
        }

        Alert.alert(
          t('auth.register.success.title'),
          response.username
            ? `${t('auth.register.success.message')}\n\nYour username is: ${response.username}`
            : t('auth.register.success.message'),
          [
            {
              text: t('auth.register.success.loginButton'),
              onPress: () => {
                navigation.navigate('Login', {
                  email: response.username || response.email || formData.email // Pre-fill username or email
                });
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        setErrors({
          submit: response.message || t('auth.register.errors.registrationFailed')
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : t('auth.register.errors.registrationFailed')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
            styles.scrollContent,
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
            <Text style={styles.welcomeText}>{t('auth.register.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>
          </View>

          <View style={[styles.formContainer, IS_TABLET && styles.tabletFormContainer]}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={IS_TABLET ? 24 : 20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.register.placeholders.firstName')}
                placeholderTextColor="#666"
                value={formData.firstName}
                onChangeText={(text) => handleChange('firstName', text)}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  }, 100);
                }}
              />
            </View>
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={IS_TABLET ? 24 : 20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.register.placeholders.lastName')}
                placeholderTextColor="#666"
                value={formData.lastName}
                onChangeText={(text) => handleChange('lastName', text)}
              />
            </View>
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={IS_TABLET ? 24 : 20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.register.placeholders.email')}
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
              />
            </View>
            <Text style={styles.helperText}>
              {t('auth.register.helpers.noEmailWarning')}
            </Text>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={IS_TABLET ? 24 : 20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.register.placeholders.password')}
                placeholderTextColor="#666"
                secureTextEntry={true}
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
              />
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={IS_TABLET ? 24 : 20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.register.placeholders.confirmPassword')}
                placeholderTextColor="#666"
                secureTextEntry={true}
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
              />
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            {errors.submit && <Text style={styles.errorText}>{errors.submit}</Text>}

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.registerButtonText}>{t('auth.register.createButton')}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>{t('auth.register.haveAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>{t('auth.register.signIn')}</Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: getFontSize(32),
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: getFontSize(16),
    color: '#FFF',
    opacity: 0.8,
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: IS_TABLET ? 30 : 20,
    paddingTop: IS_TABLET ? 40 : 30,
    paddingBottom: 20,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: IS_TABLET ? 16 : 12,
  },
  inputIcon: {
    marginRight: IS_TABLET ? 12 : 10,
  },
  input: {
    flex: 1,
    height: IS_TABLET ? 60 : 50,
    color: '#333',
    fontSize: getFontSize(16),
  },
  errorText: {
    color: '#FF3B30',
    fontSize: getFontSize(12),
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: '#2473E0',
    borderRadius: 10,
    height: IS_TABLET ? 60 : 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: getFontSize(18),
    fontWeight: '600',
  },
  loginLinkText: {
    color: '#FFF',
    fontSize: getFontSize(16),
    fontWeight: 'bold',
    marginLeft: 5,
  },
  helperText: {
    color: '#666',
    fontSize: getFontSize(12),
    marginTop: -10,
    marginBottom: 15,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#666',
    fontSize: getFontSize(14),
  },
  loginLink: {
    color: '#2473E0',
    fontSize: getFontSize(14),
    fontWeight: '600',
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

export default RegisterScreen;
