import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { resetPassword } from '../services/AuthService';
import { useTranslation } from 'react-i18next';

type Props = StackScreenProps<RootStackParamList, 'NewPassword'>;

const NewPasswordScreen = ({ navigation, route }: Props) => {
  const { t } = useTranslation();
  const { email } = route.params;
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateInputs = (code: string, newPass: string, confirmPass: string): string | null => {
    if (!code) return t('auth.newPassword.errors.resetCodeRequired');
    if (!newPass) return t('auth.newPassword.errors.required');
    if (newPass.length < 6) return t('auth.newPassword.errors.minLength');
    if (newPass !== confirmPass) return t('auth.newPassword.errors.mismatch');
    return null;
  };

  const handleTextChange = (text: string, field: 'code' | 'new' | 'confirm') => {
    // Clear previous messages
    setError('');
    setSuccess(false);
    
    if (field === 'code') {
      setResetCode(text);
    } else if (field === 'new') {
      setNewPassword(text);
    } else {
      setConfirmPassword(text);
    }
  };

  const handleUpdatePassword = async () => {
    // Clear previous messages
    setError('');
    setSuccess(false);

    const validationError = validateInputs(resetCode, newPassword, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email, newPassword, resetCode);
      
      if (result.success) {
        setSuccess(true);
        // Reset navigation stack and navigate to login after a short delay
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }, 2000);
      } else {
        setError(result.message || t('auth.newPassword.errors.updateFailed'));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : t('auth.newPassword.errors.updateFailed'));
    } finally {
      setLoading(false);
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
        <View style={styles.headerSection}>
          <Text style={styles.headerText}>{t('auth.newPassword.title')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.newPassword.subtitle')}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.newPassword.placeholders.resetCode')}
              placeholderTextColor="#666"
              value={resetCode}
              onChangeText={(text) => handleTextChange(text, 'code')}
              keyboardType="default"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.newPassword.placeholders.newPassword')}
              placeholderTextColor="#666"
              secureTextEntry={true}
              value={newPassword}
              onChangeText={(text) => handleTextChange(text, 'new')}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.newPassword.placeholders.confirmPassword')}
              placeholderTextColor="#666"
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={(text) => handleTextChange(text, 'confirm')}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{t('auth.newPassword.success')}</Text> : null}

          <TouchableOpacity
            style={[styles.updateButton, loading && styles.updateButtonDisabled]}
            onPress={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>{t('auth.newPassword.updateButton')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>{t('auth.newPassword.cancelButton')}</Text>
          </TouchableOpacity>
        </View>
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
  successText: {
    color: '#008036',
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 4,
  },
  updateButton: {
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
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default NewPasswordScreen;