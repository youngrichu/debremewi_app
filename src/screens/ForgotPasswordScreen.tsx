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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { requestPasswordReset } from '../services/AuthService';
import { RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return t('auth.forgotPassword.errors.requiredEmail');
    if (!/\S+@\S+\.\S+/.test(email)) return t('auth.forgotPassword.errors.invalidEmail');
    return null;
  };

  const handleNext = async () => {
    const error = validateEmail(email);
    if (error) {
      setError(error);
      return;
    }

    try {
      // Request password reset - this will send a reset code to the user's email
      const response = await requestPasswordReset(email);
      if (response.success) {
        navigation.navigate('NewPassword', { 
          email
        });
      } else {
        setError(response.message || t('auth.forgotPassword.errors.verificationFailed'));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : t('auth.forgotPassword.errors.failedToVerify'));
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#2473E0', '#1E5BB8']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={styles.headerText}>{t('auth.forgotPassword.title')}</Text>
            <Text style={styles.subtitle}>
              {t('auth.forgotPassword.subtitle')}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.forgotPassword.placeholders.email')}
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>{t('auth.forgotPassword.nextButton')}</Text>
            </TouchableOpacity>
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
  },
  headerSection: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
    lineHeight: 24,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    marginTop: 30,
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
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 4,
  },
  nextButton: {
    backgroundColor: '#2473E0',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
