import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateUserProfile } from '../store/userSlice';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList, UserProfile } from '../types';
import { getValidationError } from '../utils/validation';

type EditProfileScreenNavigationProp = NavigationProp<RootStackParamList>;

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  residencyCity?: string;
}

export default function EditProfileScreen() {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.user);
  const currentUser = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    phoneNumber: currentUser.phoneNumber,
    gender: currentUser.gender,
    christianName: currentUser.christianName || '',
    residencyCity: currentUser.residencyCity,
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
      const result = await dispatch(updateUserProfile(formData)).unwrap();
      
      if (result) {
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={styles.container}>
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
            style={[styles.input, errors.lastName && styles.inputError]}
            value={formData.lastName}
            onChangeText={(text) => handleChange('lastName', text)}
            onBlur={() => handleBlur('lastName')}
            placeholder="Enter your last name"
          />
          {touched.lastName && errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={[styles.input, errors.phoneNumber && styles.inputError]}
            value={formData.phoneNumber}
            onChangeText={(text) => handleChange('phoneNumber', text)}
            onBlur={() => handleBlur('phoneNumber')}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
          {touched.phoneNumber && errors.phoneNumber && (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.gender}
              onValueChange={(value: 'male' | 'female' | 'prefer_not_to_say') => 
                handleChange('gender', value)}
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
            style={[styles.input, errors.christianName && styles.inputError]}
            value={formData.christianName}
            onChangeText={(text) => handleChange('christianName', text)}
            onBlur={() => handleBlur('christianName')}
            placeholder="Enter your Christian name"
          />
          {touched.christianName && errors.christianName && (
            <Text style={styles.errorText}>{errors.christianName}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City of Residence *</Text>
          <TextInput
            style={[styles.input, errors.residencyCity && styles.inputError]}
            value={formData.residencyCity}
            onChangeText={(text) => handleChange('residencyCity', text)}
            onBlur={() => handleBlur('residencyCity')}
            placeholder="Enter your city"
          />
          {touched.residencyCity && errors.residencyCity && (
            <Text style={styles.errorText}>{errors.residencyCity}</Text>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Save Changes</Text>
          )}
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
  submitButtonDisabled: {
    opacity: 0.7,
  },
}); 