import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateUserProfile } from '../store/userSlice';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList, UserProfile, ValidationErrors } from '../types';
import { getValidationError } from '../utils/validation';

type OnboardingScreenNavigationProp = NavigationProp<RootStackParamList>;

export default function OnboardingScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: 'prefer_not_to_say' as const,
    christianName: '',
    residencyCity: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    const error = getValidationError(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    return !error;
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (formData[field as keyof UserProfile]) {
      validateField(field, formData[field as keyof UserProfile] as string);
    }
  };

  const handleSubmit = async () => {
    // Validate all fields
    const validationErrors: ValidationErrors = {};
    let isValid = true;

    ['firstName', 'lastName', 'phoneNumber', 'residencyCity'].forEach(field => {
      const error = getValidationError(field, formData[field as keyof UserProfile] as string);
      if (error) {
        validationErrors[field as keyof ValidationErrors] = error;
        isValid = false;
      }
    });

    if (!isValid) {
      setErrors(validationErrors);
      Alert.alert('Validation Error', 'Please correct the errors in the form');
      return;
    }

    try {
      await dispatch(updateUserProfile({
        ...formData,
        isOnboardingComplete: true
      })).unwrap();
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      let errorMessage = 'Failed to save profile';
      
      if (error instanceof Error) {
        switch (error.message) {
          case 'Network Error':
            errorMessage = 'Please check your internet connection';
            break;
          case 'Invalid phone number format':
            errorMessage = 'The phone number format is invalid';
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>Help us get to know you better</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            value={formData.firstName}
            onChangeText={(text) => handleChange('firstName', text)}
            onBlur={() => handleBlur('firstName')}
            placeholder="Enter your first name"
          />
          {touched.firstName && errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.lastName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
            placeholder="Enter your last name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.gender}
              onValueChange={(value: 'male' | 'female' | 'prefer_not_to_say') => setFormData(prev => ({ ...prev, gender: value }))}
              style={styles.picker}
            >
              <Picker.Item label="Prefer not to say" value="prefer_not_to_say" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Christian Name (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.christianName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, christianName: text }))}
            placeholder="Enter your Christian name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City of Residence *</Text>
          <TextInput
            style={styles.input}
            value={formData.residencyCity}
            onChangeText={(text) => setFormData(prev => ({ ...prev, residencyCity: text }))}
            placeholder="Enter your city"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Complete Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    marginBottom: 32,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
  },
}); 