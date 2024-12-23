import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../store/slices/userSlice';
import { ProfileService } from '../services/ProfileService';
import { CustomPicker } from '../components/CustomPicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { RootState } from '../store';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Text } from '../components/Text';

// Import the same constants and options from OnboardingScreen
import {
  UAE_CITIES,
  EDUCATION_LEVEL_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  SERVICE_AT_PARISH_OPTIONS,
  MINISTRY_SERVICE_OPTIONS,
  CHRISTIAN_LIFE_OPTIONS,
  GENDER_OPTIONS,
  YES_NO_OPTIONS,
} from '../constants/options';

// Add these interfaces at the top
interface FormErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: string;
  residencyCity?: string;
  residenceAddress?: string;
  [key: string]: string | undefined;
}

interface DropdownState {
  gender: boolean;
  maritalStatus: boolean;
  educationLevel: boolean;
  residencyCity: boolean;
  christianLife: boolean;
  serviceAtParish: boolean;
  ministryService: boolean;
  hasFatherConfessor: boolean;
  hasAssociationMembership: boolean;
  residencePermit: boolean;
  hasChildren: boolean;
}

// Add proper typing for form data
interface FormData extends UserData {}

// Update the formatDisplayValue function
const formatDisplayValue = (value: string | null | undefined, options?: { [key: string]: string }) => {
  if (!value) return 'Not provided';
  
  // If options map is provided, use it to map values to display text
  if (options && options[value]) {
    return options[value];
  }

  // Special case for "Media and IT"
  if (value === 'media_and_it') {
    return 'Media and IT';
  }

  // Replace underscores with spaces and capitalize each word
  return value
    .split('_')
    .map(word => {
      // Keep "IT" uppercase
      if (word.toLowerCase() === 'it') {
        return 'IT';
      }
      // Regular capitalization for other words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

// Add these functions before the return statement in EditProfileScreen
const getPickerOptions = (pickerName: string): string[] => {
  console.log('Getting options for:', pickerName);
  let options: string[] = [];
  
  switch (pickerName) {
    case 'gender':
      options = GENDER_OPTIONS;
      break;
    case 'maritalStatus':
      options = MARITAL_STATUS_OPTIONS;
      break;
    case 'educationLevel':
      options = EDUCATION_LEVEL_OPTIONS;
      break;
    case 'residencyCity':
      options = UAE_CITIES;
      break;
    case 'christianLife':
      options = CHRISTIAN_LIFE_OPTIONS;
      break;
    case 'serviceAtParish':
      options = SERVICE_AT_PARISH_OPTIONS;
      break;
    case 'ministryService':
      options = MINISTRY_SERVICE_OPTIONS;
      break;
    case 'hasFatherConfessor':
    case 'residencePermit':
    case 'hasChildren':
    case 'hasAssociationMembership':
      options = YES_NO_OPTIONS;
      break;
    default:
      console.log('No options found for:', pickerName);
  }
  
  console.log('Options:', options);
  return options;
};

const getPickerTitle = (pickerName: string) => {
  switch (pickerName) {
    case 'gender':
      return 'Select Gender';
    case 'maritalStatus':
      return 'Select Marital Status';
    case 'educationLevel':
      return 'Select Education Level';
    case 'residencyCity':
      return 'Select City';
    case 'christianLife':
      return 'Select Christian Life Status';
    case 'serviceAtParish':
      return 'Select Service Type';
    case 'ministryService':
      return 'Select Sub-department Service';
    case 'hasFatherConfessor':
      return 'Do you have a Father Confessor?';
    case 'residencePermit':
      return 'Select Residence Permit Status';
    case 'hasChildren':
      return 'Do you have children?';
    case 'hasAssociationMembership':
      return 'Are you a member of any Church Association?';
    default:
      return 'Select an Option';
  }
};

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userData } = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(userData || {});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const { t } = useTranslation();

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.trim() === '' ? undefined : value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    if (!formData.residencyCity?.trim()) {
      newErrors.residencyCity = 'City is required';
    }
    if (!formData.residenceAddress?.trim()) {
      newErrors.residenceAddress = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await ProfileService.updateProfile(formData);
      dispatch(setUserData(updatedUser));
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        handleChange('photo', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const getSelectedValueDisplay = (field: string, value: string | null | undefined) => {
    if (!value) return t('common.select');

    // For yes/no fields
    if (['hasFatherConfessor', 'hasAssociationMembership', 'residencePermit'].includes(field)) {
      return t(`common.${value.toLowerCase()}`);
    }

    // For cities
    if (field === 'residencyCity') {
      return t(`profile.options.cities.${value}`);
    }

    // For all other fields
    return t(`profile.options.${field}.${value}`);
  };

  // Update renderFormField to use proper translation paths
  const renderFormField = (
    field: keyof UserState,
    isRequired: boolean = false,
    keyboardType: 'default' | 'email-address' | 'numeric' | 'phone-pad' = 'default'
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {t(`profile.fields.${field}`)} {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, errors[field] ? styles.inputError : undefined]}
        value={formData[field]?.toString() || ''}
        onChangeText={(text) => handleChange(field, text)}
        placeholder={t(`profile.placeholders.enter${field.charAt(0).toUpperCase() + field.slice(1)}`)}
        keyboardType={keyboardType}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{t(`validation.required.${field}`)}</Text>
      )}
    </View>
  );

  // Fix section titles
  const renderSectionTitle = (section: string) => (
    <Text style={styles.sectionTitle}>
      {t(`profile.sections.${section}`)}
    </Text>
  );

  // Fix field labels
  const renderFieldLabel = (field: string, isRequired: boolean = false) => (
    <Text style={styles.label}>
      {t(`profile.fields.${field}`)} {isRequired && <Text style={styles.required}>*</Text>}
    </Text>
  );

  // Fix picker display values
  const getPickerDisplayValue = (field: string, value: string | null | undefined) => {
    if (!value) return t('common.select');

    // For yes/no fields
    if (['hasFatherConfessor', 'hasAssociationMembership', 'residencePermit', 'hasChildren'].includes(field)) {
      return t(`common.${value.toLowerCase()}`);
    }

    // For cities
    if (field === 'residencyCity') {
      return t(`profile.options.cities.${value}`);
    }

    // For all other fields
    return t(`profile.options.${field}.${value}`);
  };

  // Fix picker button
  const renderPickerButton = (field: string, isRequired: boolean = false) => (
    <View style={styles.inputGroup}>
      {renderFieldLabel(field, isRequired)}
      <TouchableOpacity 
        style={styles.pickerButton}
        onPress={() => setOpenPicker(field)}
      >
        <Text style={styles.pickerButtonText}>
          {formData[field as keyof typeof formData] 
            ? getPickerDisplayValue(field, formData[field as keyof typeof formData])
            : t(`profile.selects.select${field.charAt(0).toUpperCase() + field.slice(1)}`)}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const getProfilePhoto = () => {
    if (!formData) return null;
    return formData.profilePhotoUrl || formData.profilePhoto || formData.photo;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{t('profile.editProfile')}</Text>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Photo Upload Section */}
            <View style={styles.photoSection}>
              <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
                {(formData.photo || formData.profile_photo || formData.profile_photo_url || formData.avatar_url) ? (
                  <View style={styles.photoContent}>
                    <Image 
                      source={{ 
                        uri: formData.photo || formData.profile_photo || formData.profile_photo_url || formData.avatar_url
                      }} 
                      style={styles.profilePhoto} 
                    />
                    <Text style={styles.photoHelper}>{t('profile.helpers.changePhoto')}</Text>
                  </View>
                ) : (
                  <View style={styles.photoContent}>
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="cloud-upload-outline" size={40} color="#2196F3" />
                    </View>
                    <Text style={styles.photoHelper}>{t('profile.helpers.photo')}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              {/* Personal Information */}
              {renderSectionTitle('personalInfo')}
              {renderFormField('firstName', true)}
              {renderFormField('lastName', true)}
              {renderFormField('christianName')}
              {renderPickerButton('gender', true)}
              {renderPickerButton('maritalStatus')}
              {renderPickerButton('educationLevel')}
              {renderFormField('occupation')}

              {/* Contact Information */}
              {renderSectionTitle('contactInfo')}
              {renderFormField('phoneNumber', true, 'phone-pad')}
              {renderPickerButton('residencyCity', true)}
              {renderFormField('residenceAddress', true)}
              {renderFormField('emergencyContact')}

              {/* Church Information */}
              {renderSectionTitle('churchInfo')}
              {renderPickerButton('christianLife')}
              {renderPickerButton('serviceAtParish')}
              {formData.serviceAtParish && formData.serviceAtParish !== 'none' && (
                renderPickerButton('ministryService')
              )}
              {renderPickerButton('hasFatherConfessor')}
              {formData.hasFatherConfessor === 'yes' && renderFormField('fatherConfessorName')}
              {renderPickerButton('hasAssociationMembership')}
              {formData.hasAssociationMembership === 'yes' && renderFormField('associationName')}

              {/* Additional Information */}
              {renderSectionTitle('additionalInfo')}
              {renderPickerButton('residencePermit')}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>{t('profile.messages.saveChanges')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Picker Modal */}
        {openPicker && (
          <CustomPicker
            visible={true}
            onClose={() => setOpenPicker(null)}
            pickerName={openPicker}
            onSelect={(value) => {
              handleChange(openPicker as keyof typeof formData, value);
              setOpenPicker(null);
            }}
            selectedValue={formData[openPicker as keyof typeof formData]?.toString()}
          />
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 120,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  photoSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  photoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
  },
  photoHelper: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  formSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  required: {
    color: '#FF3B30',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  avatarText: {
    color: '#2196F3',
    fontSize: 40,
    fontWeight: 'bold',
  },
  // Add more styles as needed...
}); 