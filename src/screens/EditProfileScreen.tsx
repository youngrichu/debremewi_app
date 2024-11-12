import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../store/userSlice';
import { ProfileService } from '../services/ProfileService';
import { CustomPicker } from '../components/CustomPicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { RootState } from '../store';
import { useNavigation } from '@react-navigation/native';

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
const getPickerOptions = (pickerName: string) => {
  console.log('Getting options for:', pickerName);
  switch (pickerName) {
    case 'gender':
      return GENDER_OPTIONS;
    case 'maritalStatus':
      return MARITAL_STATUS_OPTIONS;
    case 'educationLevel':
      return EDUCATION_LEVEL_OPTIONS;
    case 'residencyCity':
      return UAE_CITIES;
    case 'christianLife':
      return CHRISTIAN_LIFE_OPTIONS;
    case 'serviceAtParish':
      return SERVICE_AT_PARISH_OPTIONS;
    case 'ministryService':
      return MINISTRY_SERVICE_OPTIONS;
    case 'hasFatherConfessor':
    case 'residencePermit':
    case 'hasChildren':
    case 'hasAssociationMembership':
      return YES_NO_OPTIONS;
    default:
      console.log('No options found for:', pickerName);
      return [];
  }
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
  const currentUser = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [formData, setFormData] = useState(currentUser);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.trim() === '' ? null : value
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
      dispatch(setUser(updatedUser));
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

  // Add this helper function for rendering form fields
  const renderFormField = (
    label: string,
    field: keyof typeof formData,
    placeholder: string,
    isRequired: boolean = false,
    keyboardType: 'default' | 'email-address' | 'numeric' | 'phone-pad' = 'default'
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        value={formData[field]?.toString() || ''}
        onChangeText={(text) => handleChange(field, text)}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Edit Profile</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo Upload Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity onPress={pickImage}>
              {formData.photo ? (
                <Image source={{ uri: formData.photo }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={40} color="#666" />
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Personal Information */}
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {renderFormField('First Name', 'firstName', 'Enter your first name', true)}
            {renderFormField('Last Name', 'lastName', 'Enter your last name', true)}
            {renderFormField('Christian Name', 'christianName', 'Enter your Christian name')}
            
            {/* Gender Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender *</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('gender')}
              >
                <Text style={styles.pickerButtonText}>
                  {formData.gender ? formatDisplayValue(formData.gender) : 'Select Gender'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Marital Status Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Marital Status</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('maritalStatus')}
              >
                <Text style={styles.pickerButtonText}>
                  {formData.maritalStatus ? formatDisplayValue(formData.maritalStatus) : 'Select Marital Status'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Education Level Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Education Level</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('educationLevel')}
              >
                <Text style={styles.pickerButtonText}>
                  {formData.educationLevel ? formatDisplayValue(formData.educationLevel) : 'Select Education Level'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {renderFormField('Occupation', 'occupation', 'Enter your occupation')}

            {/* Contact Information */}
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {renderFormField('Phone Number', 'phoneNumber', '+971 50 123 4567', true, 'phone-pad')}
            
            {/* City Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City of Residence *</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('residencyCity')}
              >
                <Text style={styles.pickerButtonText}>
                  {formData.residencyCity ? formatDisplayValue(formData.residencyCity) : 'Select City'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {renderFormField('Residence Address', 'residenceAddress', 'Enter your address', true)}
            {renderFormField('Emergency Contact', 'emergencyContact', 'Enter emergency contact details')}

            {/* Church Information */}
            <Text style={styles.sectionTitle}>Church Information</Text>
            
            {/* Christian Life Status Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Christian Life Status</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('christianLife')}
              >
                <Text style={styles.pickerButtonText}>
                  {formData.christianLife ? formatDisplayValue(formData.christianLife) : 'Select Christian Life Status'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Service at Parish Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service at Parish</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('serviceAtParish')}
              >
                <Text style={styles.pickerButtonText}>
                  {formData.serviceAtParish ? formatDisplayValue(formData.serviceAtParish) : 'Select Service Type'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Ministry Service Picker */}
            {formData.serviceAtParish && formData.serviceAtParish !== 'none' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sub-department Service</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setOpenPicker('ministryService')}
                >
                  <Text style={styles.pickerButtonText}>
                    {formData.ministryService ? formatDisplayValue(formData.ministryService) : 'Select Sub-department Service'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {/* Father Confessor Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Do you have a Father Confessor?</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('hasFatherConfessor')}
              >
                <Text style={styles.pickerButtonText}>
                  {formData.hasFatherConfessor ? formatDisplayValue(formData.hasFatherConfessor) : 'Select Option'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {formData.hasFatherConfessor === 'yes' && 
              renderFormField('Father Confessor Name', 'fatherConfessorName', 'Enter name of your Father Confessor')}

            {/* Association Membership Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Church Association Membership</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('hasAssociationMembership')}
              >
                <Text style={styles.pickerButtonText}>
                  {formData.hasAssociationMembership ? formatDisplayValue(formData.hasAssociationMembership) : 'Select Option'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {formData.hasAssociationMembership === 'yes' && 
              renderFormField('Association Name', 'associationName', 'Enter name of association')}

            {/* Additional Information */}
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            {/* Residence Permit Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>UAE Residence Status</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('residencePermit')}
              >
                <Text style={styles.pickerButtonText}>
                  {formData.residencePermit ? formatDisplayValue(formData.residencePermit) : 'Select Residence Permit Status'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Picker Modal */}
        {openPicker && (
          <CustomPicker
            visible={true}
            onClose={() => setOpenPicker(null)}
            options={getPickerOptions(openPicker)}
            onSelect={(value) => {
              handleChange(openPicker, value);
              setOpenPicker(null);
            }}
            selectedValue={formData[openPicker as keyof typeof formData]?.toString()}
            title={getPickerTitle(openPicker)}
          />
        )}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    padding: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginVertical: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  changePhotoText: {
    color: '#2196F3',
    marginTop: 10,
    fontSize: 16,
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
  // Add more styles as needed...
}); 