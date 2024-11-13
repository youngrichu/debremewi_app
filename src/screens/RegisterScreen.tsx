import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { register } from '../services/AuthService';
import { useTranslation } from 'react-i18next';

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

const RegisterScreen = ({ navigation }) => {
  const { t } = useTranslation();
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

    if (!data.firstName.trim()) errors.firstName = t('auth.register.errors.firstName');
    if (!data.lastName.trim()) errors.lastName = t('auth.register.errors.lastName');
    
    if (!data.email.trim()) {
      errors.email = t('auth.register.errors.requiredEmail');
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = t('auth.register.errors.invalidEmail');
    }

    if (!data.password) {
      errors.password = t('auth.register.errors.requiredPassword');
    } else if (data.password.length < 6) {
      errors.password = t('auth.register.errors.minLengthPassword');
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = t('auth.register.errors.passwordMismatch');
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
      const response = await register(formData.email, formData.password);
      
      if (response.token) {
        Alert.alert(
          'Success',
          t('auth.register.success'),
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        setErrors({ 
          submit: t('auth.register.errors.registrationFailed')
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
    >
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={styles.welcomeText}>{t('auth.register.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.nameRow}>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.register.placeholders.firstName')}
                  placeholderTextColor="#666"
                  value={formData.firstName}
                  onChangeText={(text) => handleChange('firstName', text)}
                />
              </View>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.register.placeholders.lastName')}
                  placeholderTextColor="#666"
                  value={formData.lastName}
                  onChangeText={(text) => handleChange('lastName', text)}
                />
              </View>
            </View>
            {(errors.firstName || errors.lastName) && (
              <Text style={styles.errorText}>{errors.firstName || errors.lastName}</Text>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
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
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
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
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.register.placeholders.confirmPassword')}
                placeholderTextColor="#666"
                secureTextEntry={true}
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
              />
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>{t('auth.register.createButton')}</Text>
              )}
            </TouchableOpacity>

            {errors.submit && <Text style={styles.errorText}>{errors.submit}</Text>}

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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
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
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: '#2196F3',
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
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
