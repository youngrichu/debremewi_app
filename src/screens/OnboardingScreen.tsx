import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { completeOnboarding, setUser } from '../store/userSlice';
import { ProfileService } from '../services/ProfileService';
import { CustomPicker } from '../components/CustomPicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const STEPS = [
  'Welcome',
  'Personal',
  'Contact',
  'Church',
  'Additional'
];

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: string;
  residencyCity?: string;
  christianName: string;
  maritalStatus?: string;
  hasChildren?: string;
  numberOfChildren?: string;
  christianLife?: string;
  serviceAtParish?: string;
  ministryService?: string;
  confessionFather?: string;
  residenceAddress: string;
  educationLevel?: string;
  occupation?: string;
  residencePermit?: string;
  emergencyContact?: string;
  photo?: string;
  hasFatherInFaith: string;
  fatherInFaithName: string;
  hasAssociationMembership: string;
  hasFatherConfessor: string;
  fatherConfessorName: string;
}

export const UAE_CITIES = [
  { label: 'Dubai', value: 'dubai' },
  { label: 'Abu Dhabi', value: 'abu_dhabi' },
  { label: 'Sharjah', value: 'sharjah' },
  { label: 'Ajman', value: 'ajman' },
  { label: 'Ras Al Khaimah', value: 'ras_al_khaimah' },
  { label: 'Fujairah', value: 'fujairah' },
  { label: 'Umm Al Quwain', value: 'umm_al_quwain' },
  { label: 'Al Ain', value: 'al_ain' }
];

// Update the interface for options
interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

// Update the constants with disabled first options
export const SERVICE_AT_PARISH_OPTIONS: DropdownOption[] = [
  { label: 'Select a Service Type', value: 'sub_department', disabled: true },
  { label: 'Accounting and Budget', value: 'accounting' },
  { label: 'Finance', value: 'finance' },
  { label: 'Treasurer', value: 'treasurer' },
  { label: 'Education and Training', value: 'education' },
  { label: 'Public Relation', value: 'public_relation' },
  { label: 'Development', value: 'development' },
  { label: 'Construction and Renovation', value: 'construction' },
  { label: 'Law and Order/Discipline', value: 'law_order' },
  { label: 'Charity/Philanthropy', value: 'charity' },
  { label: 'Religious Education', value: 'religious_education' },
  { label: 'Property Management', value: 'property' },
  { label: 'Parish Council Coordination', value: 'council' },
  { label: 'Offering Collector', value: 'offering' },
  { label: 'Statistician', value: 'statistician' },
  { label: 'Media and IT', value: 'media_it' }
];

export const MINISTRY_SERVICE_OPTIONS: DropdownOption[] = [
  { label: 'Select a Sub-department Service', value: 'sub_department', disabled: true },
  { label: 'Accounting and Budget', value: 'accounting' },
  { label: 'Finance', value: 'finance' },
  { label: 'Treasurer', value: 'treasurer' },
  { label: 'Education and Training', value: 'education' },
  { label: 'Public Relation', value: 'public_relation' },
  { label: 'Development', value: 'development' },
  { label: 'Construction and Renovation', value: 'construction' },
  { label: 'Law and Order/Discipline', value: 'law_order' },
  { label: 'Charity/Philanthropy', value: 'charity' },
  { label: 'Religious Education', value: 'religious_education' },
  { label: 'Property Management', value: 'property' },
  { label: 'Parish Council Coordination', value: 'council' },
  { label: 'Offering Collector', value: 'offering' },
  { label: 'Statistician', value: 'statistician' },
  { label: 'Media', value: 'media' },
  { label: 'IT', value: 'it' }
];

export const CHRISTIAN_LIFE_OPTIONS: DropdownOption[] = [
  { label: 'Select Christian Life Status', value: '', disabled: true },
  { label: 'Not Repented', value: 'not_repent' },
  { label: 'Repented', value: 'repent' },
  { label: 'Takes Holy Communion', value: 'communion' }
];

export const MARITAL_STATUS_OPTIONS: DropdownOption[] = [
  { label: 'Select Marital Status', value: '', disabled: true },
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Divorced', value: 'divorced' },
  { label: 'Widowed', value: 'widowed' }
];

export const EDUCATION_LEVEL_OPTIONS: DropdownOption[] = [
  { label: 'Select Education Level', value: '', disabled: true },
  { label: 'Student', value: 'student' },
  { label: 'Completed Grade 10', value: 'grade_10' },
  { label: 'Completed Grade 12', value: 'grade_12' },
  { label: 'Diploma', value: 'diploma' },
  { label: 'Degree', value: 'degree' },
  { label: "Master's", value: 'masters' },
  { label: 'Doctorate', value: 'doctorate' }
];

// Add these constants at the top with other options
export const HAS_CHILDREN_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' }
];

// Add these constants at the top with other options
export const FATHER_IN_FAITH_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' }
];

export const ASSOCIATION_MEMBERSHIP_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' }
];

export const FATHER_CONFESSOR_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' }
];

export default function OnboardingScreen() {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    phoneNumber: string;
    gender: string;
    christianName: string;
    residencyCity: string;
    maritalStatus: string;
    hasChildren: string;
    numberOfChildren: string;
    christianLife: string;
    serviceAtParish: string;
    ministryService: string;
    confessionFather: string;
    residenceAddress: string;
    educationLevel: string;
    occupation: string;
    residencePermit: string;
    emergencyContact: string;
    photo: string;
    hasFatherInFaith: string;
    fatherInFaithName: string;
    hasAssociationMembership: string;
    hasFatherConfessor: string;
    fatherConfessorName: string;
    associationName: string;
  }>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
    christianName: '',
    residencyCity: '',
    maritalStatus: '',
    hasChildren: '',
    numberOfChildren: '',
    christianLife: '',
    serviceAtParish: '',
    ministryService: '',
    confessionFather: '',
    residenceAddress: '',
    educationLevel: '',
    occupation: '',
    residencePermit: '',
    emergencyContact: '',
    photo: '',
    hasFatherInFaith: '',
    fatherInFaithName: '',
    hasAssociationMembership: '',
    hasFatherConfessor: '',
    fatherConfessorName: '',
    associationName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<DropdownState>({
    gender: false,
    maritalStatus: false,
    education: false,
    city: false,
    christianLife: false,
    serviceParish: false,
    confessionFather: false,
    residencePermit: false,
  });
  const [isAnyDropdownOpen, setIsAnyDropdownOpen] = useState(false);
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleDropdownOpen = (dropdownName: keyof DropdownState) => {
    setOpenDropdowns(prev => {
      const allClosed = Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: key === dropdownName ? !prev[key as keyof DropdownState] : false
      }), {} as DropdownState);
      
      setIsAnyDropdownOpen(Object.values(allClosed).some(value => value));
      
      return allClosed;
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    
    switch (step) {
      case 1: // Personal Info
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        }
        if (!formData.gender) {
          newErrors.gender = 'Gender is required';
        }
        break;
      case 2: // Contact Details
        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        }
        if (!formData.residencyCity.trim()) {
          newErrors.residencyCity = 'City of residence is required';
        }
        if (!formData.residenceAddress.trim()) {
          newErrors.residenceAddress = 'Address is required';
        }
        break;
      // Add validation for other steps if needed
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    console.log('Current step:', currentStep);

    if (currentStep === 0) {
      setCurrentStep(prev => prev + 1);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      }, 100);
      return;
    }

    if (validateStep(currentStep)) {
      console.log('Validation passed, moving to next step');
      setCurrentStep(prev => {
        const nextStep = Math.min(prev + 1, STEPS.length - 1);
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
        }, 100);
        return nextStep;
      });
    } else {
      console.log('Validation failed');
      Alert.alert(
        'Required Fields',
        'Please fill in all required fields before proceeding.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => {
      const newStep = Math.max(prev - 1, 0);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      }, 100);
      return newStep;
    });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const cleanedFormData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      const updatedUser = await ProfileService.updateProfile({
        ...cleanedFormData,
        isOnboardingComplete: true,
      });

      dispatch(setUser({
        ...updatedUser,
        isOnboardingComplete: true,
      }));

      dispatch(completeOnboarding());
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert('Error', 'Failed to complete profile setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    console.log(`Updating ${field} with value:`, value);
    setFormData(prev => {
      const newState = { 
        ...prev, 
        [field]: value.trim() === '' ? null : value 
      };
      console.log('New form state:', newState);
      return newState;
    });
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        {STEPS.map((step, index) => (
          <View key={index} style={styles.progressStepContainer}>
            <View style={styles.stepNumberContainer}>
              <View
                style={[
                  styles.progressStep,
                  index <= currentStep ? styles.progressStepCompleted : null
                ]}
              >
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <Text style={[
                styles.progressStepText,
                index === currentStep && styles.progressStepTextActive
              ]}>
                {step}
              </Text>
            </View>
            {index < STEPS.length - 1 && (
              <View 
                style={[
                  styles.progressLine,
                  index < currentStep ? styles.progressLineCompleted : null
                ]} 
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderWelcomeStep = () => (
    <View style={styles.welcomeContainer}>
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeTitle}>Welcome to{'\n'}Dubai Debre Mewi</Text>
        <Text style={styles.welcomeSubtitle}>
          St. Michael and St. Hripsime{'\n'}Ethiopian Orthodox Tewahedo Church
        </Text>
      </View>
      
      <Text style={styles.welcomeDescription}>
        Join our vibrant church community and stay connected with these features:
      </Text>
      
      <View style={styles.welcomePoints}>
        <View style={styles.welcomePoint}>
          <Ionicons name="calendar" size={24} color="#2196F3" />
          <View style={styles.pointTextContainer}>
            <Text style={styles.pointTitle}>Church Events</Text>
            <Text style={styles.pointDescription}>Stay updated with church services and events</Text>
          </View>
        </View>

        <View style={styles.welcomePoint}>
          <Ionicons name="people" size={24} color="#2196F3" />
          <View style={styles.pointTextContainer}>
            <Text style={styles.pointTitle}>Community</Text>
            <Text style={styles.pointDescription}>Connect with fellow church members</Text>
          </View>
        </View>

        <View style={styles.welcomePoint}>
          <Ionicons name="notifications" size={24} color="#2196F3" />
          <View style={styles.pointTextContainer}>
            <Text style={styles.pointTitle}>Notifications</Text>
            <Text style={styles.pointDescription}>Receive important church announcements</Text>
          </View>
        </View>

        <View style={styles.welcomePoint}>
          <Ionicons name="book" size={24} color="#2196F3" />
          <View style={styles.pointTextContainer}>
            <Text style={styles.pointTitle}>Spiritual Resources</Text>
            <Text style={styles.pointDescription}>Access prayers and religious content</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Personal Information</Text>
            <Text style={styles.stepDescription}>
              Please provide your basic personal details to help us serve you better.
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name (As per official documents) *</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                value={formData.firstName}
                onChangeText={(text) => handleChange('firstName', text)}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name (As per official documents) *</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                value={formData.lastName}
                onChangeText={(text) => handleChange('lastName', text)}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Christian Name (Baptismal Name)</Text>
              <TextInput
                style={styles.input}
                value={formData.christianName}
                onChangeText={(text) => handleChange('christianName', text)}
                placeholder="Enter your Christian name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender *</Text>
              <TouchableOpacity 
                style={[styles.pickerButton, errors.gender && styles.inputError]}
                onPress={() => setOpenPicker('gender')}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !formData.gender && { color: '#666' }
                ]}>
                  {formData.gender ? 
                    formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : 
                    'Select Gender'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
              
              <CustomPicker
                visible={openPicker === 'gender'}
                onClose={() => setOpenPicker(null)}
                options={[
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' }
                ]}
                onSelect={(value) => {
                  handleChange('gender', value);
                  setOpenPicker(null);
                }}
                selectedValue={formData.gender}
                title="Select Gender"
              />
            </View>

            <View style={[styles.inputGroup, { zIndex: 4000 }]}>
              <Text style={styles.label}>Current Marital Status</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('maritalStatus')}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !formData.maritalStatus && { color: '#666' }
                ]}>
                  {formData.maritalStatus ? 
                    formData.maritalStatus.charAt(0).toUpperCase() + formData.maritalStatus.slice(1) : 
                    'Select Marital Status'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              
              <CustomPicker
                visible={openPicker === 'maritalStatus'}
                onClose={() => setOpenPicker(null)}
                options={MARITAL_STATUS_OPTIONS}
                onSelect={(value) => {
                  handleChange('maritalStatus', value);
                  setOpenPicker(null);
                }}
                selectedValue={formData.maritalStatus}
                title="Select Marital Status"
              />
            </View>

            <View style={[styles.inputGroup, { zIndex: 3000 }]}>
              <Text style={styles.label}>Highest Level of Education</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => {
                  console.log('Opening education picker');
                  setOpenPicker('educationLevel');
                }}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !formData.educationLevel && { color: '#666' }
                ]}>
                  {formData.educationLevel ? 
                    EDUCATION_LEVEL_OPTIONS.find(option => {
                      return option.value === formData.educationLevel;
                    })?.label || 
                    formData.educationLevel : 
                    'Select Education Level'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              
              <CustomPicker
                visible={openPicker === 'educationLevel'}
                onClose={() => {
                  setOpenPicker(null);
                }}
                options={EDUCATION_LEVEL_OPTIONS}
                onSelect={(value) => {
                  handleChange('educationLevel', value);
                  setOpenPicker(null);
                }}
                selectedValue={formData.educationLevel}
                title="Select Education Level"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Do you have children under your care?</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('hasChildren')}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !formData.hasChildren && { color: '#666' }
                ]}>
                  {formData.hasChildren ? 
                    formData.hasChildren === 'yes' ? 'Yes' : 'No' : 
                    'Select Option'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              
              <CustomPicker
                visible={openPicker === 'hasChildren'}
                onClose={() => setOpenPicker(null)}
                options={HAS_CHILDREN_OPTIONS}
                onSelect={(value) => {
                  handleChange('hasChildren', value);
                  // Clear numberOfChildren if 'no' is selected
                  if (value === 'no') {
                    handleChange('numberOfChildren', '');
                  }
                  setOpenPicker(null);
                }}
                selectedValue={formData.hasChildren}
                title="Do you have children?"
              />
            </View>

            {/* Conditional rendering for number of children */}
            {formData.hasChildren === 'yes' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Number of Children</Text>
                <TextInput
                  style={styles.input}
                  value={formData.numberOfChildren}
                  onChangeText={(text) => handleChange('numberOfChildren', text)}
                  placeholder="Enter number of children"
                  keyboardType="numeric"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Occupation/Profession</Text>
              <TextInput
                style={styles.input}
                value={formData.occupation}
                onChangeText={(text) => handleChange('occupation', text)}
                placeholder="Enter your occupation"
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Contact Information</Text>
            <Text style={styles.stepDescription}>
              Please provide your current contact details for church communications.
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Phone Number (UAE) *</Text>
              <TextInput
                style={[styles.input, errors.phoneNumber && styles.inputError]}
                value={formData.phoneNumber}
                onChangeText={(text) => handleChange('phoneNumber', text)}
                placeholder="+971 50 123 4567"
                keyboardType="phone-pad"
              />
              {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current City of Residence in UAE *</Text>
              <TouchableOpacity 
                style={[styles.pickerButton, errors.residencyCity && styles.inputError]}
                onPress={() => setOpenPicker('residencyCity')}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !formData.residencyCity && { color: '#666' }
                ]}>
                  {formData.residencyCity ? 
                    UAE_CITIES.find(city => city.value === formData.residencyCity)?.label || 
                    formData.residencyCity.replace(/_/g, ' ').charAt(0).toUpperCase() + 
                    formData.residencyCity.slice(1) : 
                    'Select City'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {errors.residencyCity && <Text style={styles.errorText}>{errors.residencyCity}</Text>}
              
              <CustomPicker
                visible={openPicker === 'residencyCity'}
                onClose={() => setOpenPicker(null)}
                options={UAE_CITIES}
                onSelect={(value) => {
                  handleChange('residencyCity', value);
                  setOpenPicker(null);
                }}
                selectedValue={formData.residencyCity}
                title="Select City"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Detailed Residential Address *</Text>
              <Text style={styles.helperText}>Include building name, flat number, and area</Text>
              <TextInput
                style={[styles.input, errors.residenceAddress && styles.inputError]}
                value={formData.residenceAddress}
                onChangeText={(text) => handleChange('residenceAddress', text)}
                placeholder="Enter your address"
                multiline
              />
              {errors.residenceAddress && <Text style={styles.errorText}>{errors.residenceAddress}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Contact Details</Text>
              <Text style={styles.helperText}>Name and phone number of a person to contact in case of emergency</Text>
              <TextInput
                style={styles.input}
                value={formData.emergencyContact}
                onChangeText={(text) => handleChange('emergencyContact', text)}
                placeholder="Enter emergency contact details"
                multiline
              />
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Church Information</Text>
            <Text style={styles.stepDescription}>
              Please provide information about your church involvement and spiritual life.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Christian Life Status</Text>
              <Text style={styles.helperText}>Select your current spiritual journey stage</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('christianLife')}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !formData.christianLife && { color: '#666' }
                ]}>
                  {formData.christianLife ? 
                    CHRISTIAN_LIFE_OPTIONS.find(option => option.value === formData.christianLife)?.label || 
                    'Select Christian Life Status' : 
                    'Select Christian Life Status'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              
              <CustomPicker
                visible={openPicker === 'christianLife'}
                onClose={() => setOpenPicker(null)}
                options={CHRISTIAN_LIFE_OPTIONS}
                onSelect={(value) => {
                  handleChange('christianLife', value);
                  setOpenPicker(null);
                }}
                selectedValue={formData.christianLife}
                title="Select Christian Life Status"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service at the Parish</Text>
              <Text style={styles.helperText}>Select the Service where you currently serve or wish to serve</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('serviceAtParish')}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !formData.serviceAtParish && { color: '#666' }
                ]}>
                  {formData.serviceAtParish ? 
                    SERVICE_AT_PARISH_OPTIONS.find(option => option.value === formData.serviceAtParish)?.label || 
                    'Select Service Type' : 
                    'Select Service Type'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              
              <CustomPicker
                visible={openPicker === 'serviceAtParish'}
                onClose={() => setOpenPicker(null)}
                options={SERVICE_AT_PARISH_OPTIONS}
                onSelect={(value) => {
                  handleChange('serviceAtParish', value);
                  setOpenPicker(null);
                }}
                selectedValue={formData.serviceAtParish}
                title="Select Service Type"
              />
            </View>

            {/* Conditional Sub-department Service dropdown */}
            {formData.serviceAtParish && formData.serviceAtParish !== 'none' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sub-department Service</Text>
                <Text style={styles.helperText}>Select the sub-department where you currently serve or wish to serve</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setOpenPicker('ministryService')}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    !formData.ministryService && { color: '#666' }
                  ]}>
                    {formData.ministryService ? 
                      MINISTRY_SERVICE_OPTIONS.find(option => option.value === formData.ministryService)?.label || 
                      'Select Sub-department Service' : 
                      'Select Sub-department Service'
                    }
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
                
                <CustomPicker
                  visible={openPicker === 'ministryService'}
                  onClose={() => setOpenPicker(null)}
                  options={MINISTRY_SERVICE_OPTIONS}
                  onSelect={(value) => {
                    handleChange('ministryService', value);
                    setOpenPicker(null);
                  }}
                  selectedValue={formData.ministryService}
                  title="Select Sub-department Service"
                />
              </View>
            )}


            <View style={styles.inputGroup}>
              <Text style={styles.label}>Do you have a Father Confessor in Dubai?</Text>
              <Text style={styles.helperText}>A spiritual father who guides your Christian journey</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('hasFatherConfessor')}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !formData.hasFatherConfessor && { color: '#666' }
                ]}>
                  {formData.hasFatherConfessor ? 
                    formData.hasFatherConfessor === 'yes' ? 'Yes' : 'No' : 
                    'Select Option'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              
              <CustomPicker
                visible={openPicker === 'hasFatherConfessor'}
                onClose={() => setOpenPicker(null)}
                options={FATHER_CONFESSOR_OPTIONS}
                onSelect={(value) => {
                  handleChange('hasFatherConfessor', value);
                  if (value === 'no') {
                    handleChange('fatherConfessorName', '');
                  }
                  setOpenPicker(null);
                }}
                selectedValue={formData.hasFatherConfessor}
                title="Do you have a Father Confessor in Dubai?"
              />
            </View>

            {formData.hasFatherConfessor === 'yes' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name of your Father Confessor</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fatherConfessorName}
                  onChangeText={(text) => handleChange('fatherConfessorName', text)}
                  placeholder="Enter name of your Father Confessor"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Church Association Membership</Text>
              <Text style={styles.helperText}>Are you a member of any church-related associations?</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('hasAssociationMembership')}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !formData.hasAssociationMembership && { color: '#666' }
                ]}>
                  {formData.hasAssociationMembership ? 
                    formData.hasAssociationMembership === 'yes' ? 'Yes' : 'No' : 
                    'Select Option'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              
              <CustomPicker
                visible={openPicker === 'hasAssociationMembership'}
                onClose={() => setOpenPicker(null)}
                options={ASSOCIATION_MEMBERSHIP_OPTIONS}
                onSelect={(value) => {
                  handleChange('hasAssociationMembership', value);
                  if (value === 'no') {
                    handleChange('associationName', '');
                  }
                  setOpenPicker(null);
                }}
                selectedValue={formData.hasAssociationMembership}
                title="Are you a member of any Church Association?"
              />
            </View>

            {formData.hasAssociationMembership === 'yes' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name of Association</Text>
                <TextInput
                  style={styles.input}
                  value={formData.associationName}
                  onChangeText={(text) => handleChange('associationName', text)}
                  placeholder="Enter name of association"
                />
              </View>
            )}
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Additional Information</Text>
            <Text style={styles.stepDescription}>
              Please provide additional details to complete your profile.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Profile Photo</Text>
              <Text style={styles.helperText}>Please upload a clear, recent photo of yourself</Text>
              <TouchableOpacity 
                style={styles.photoUploadButton}
                onPress={pickImage}
              >
                {formData.photo ? (
                  <View style={styles.photoPreviewContainer}>
                    <Image 
                      source={{ uri: formData.photo }} 
                      style={styles.photoPreview} 
                    />
                    <TouchableOpacity 
                      style={styles.removePhotoButton}
                      onPress={() => handleChange('photo', '')}
                    >
                      <Ionicons name="close-circle" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="camera" size={32} color="#666" />
                    <Text style={styles.uploadText}>Upload Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>UAE Residence Status</Text>
              <Text style={styles.helperText}>Do you have a valid UAE residence permit/visa?</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('residencePermit')}
              >
                <Text style={[
                  styles.pickerButtonText,
                  !formData.residencePermit && { color: '#666' }
                ]}>
                  {formData.residencePermit ? 
                    formData.residencePermit === 'yes' ? 'Yes' : 'No' : 
                    'Select Residence Permit Status'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const handleOpenPicker = (pickerName: string) => {
    setOpenPicker(pickerName);
  };

  const getPickerOptions = (pickerName: string) => {
    switch (pickerName) {
      case 'gender':
        return [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' }
        ];
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
        return [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ];
      case 'residencePermit':
        return [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ];
      case 'hasChildren':
        return HAS_CHILDREN_OPTIONS;
      case 'hasAssociationMembership':
        return ASSOCIATION_MEMBERSHIP_OPTIONS;
      case 'hasFatherInFaith':
        return FATHER_IN_FAITH_OPTIONS;
      default:
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
      case 'hasFatherConfessor':
        return 'Do you have a Father Confessor?';
      case 'residencePermit':
        return 'Select Residence Permit Status';
      case 'hasChildren':
        return 'Do you have children?';
      case 'ministryService':
        return 'Select Sub-department Service';
      case 'hasAssociationMembership':
        return 'Are you a member of any Church Association?';
      case 'hasFatherInFaith':
        return 'Do you have a Father in Faith?';
      default:
        return '';
    }
  };

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload photos.'
      );
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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Profile Setup</Text>
          <Text style={styles.stepIndicator}>
            Step {currentStep + 1} of {STEPS.length}
          </Text>
        </View>

        {renderProgressBar()}

        <View style={styles.mainContent}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            scrollEnabled={!isAnyDropdownOpen}
          >
            <View style={styles.content}>
              {renderStepContent()}
            </View>

            <View style={styles.buttonWrapper}>
              <View style={styles.buttonContainer}>
                {currentStep > 0 && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handlePrevious}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-back" size={20} color="#2196F3" />
                    <Text style={styles.secondaryButtonText}>Previous</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    loading && styles.buttonDisabled
                  ]}
                  onPress={currentStep === STEPS.length - 1 ? handleSubmit : handleNext}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>
                        {currentStep === STEPS.length - 1 ? 'Complete' : 'Next'}
                      </Text>
                      {currentStep < STEPS.length - 1 && (
                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                      )}
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>
      {openPicker && (
        <CustomPicker
          visible={true}
          onClose={() => setOpenPicker(null)}
          options={getPickerOptions(openPicker)}
          onSelect={(value) => {
            handleChange(openPicker, value);
            setOpenPicker(null);
          }}
          selectedValue={formData[openPicker as keyof typeof formData]}
          title={getPickerTitle(openPicker)}
        />
      )}
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
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  stepIndicator: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.8,
    marginTop: 5,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumberContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressStepCompleted: {
    backgroundColor: '#FFF',
  },
  stepNumber: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: -5,
  },
  progressLineCompleted: {
    backgroundColor: '#FFF',
  },
  progressStepText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
  },
  progressStepTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  welcomeContainer: {
    padding: 20,
  },
  welcomeHeader: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 34,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  welcomeDescription: {
    fontSize: 18,
    color: '#444',
    marginBottom: 30,
    textAlign: 'center',
  },
  welcomePoints: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
  },
  pointTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  pointTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pointDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  inputGroup: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 1000,
  },
  label: {
    fontSize: 15,
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
  mainContent: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  keyboardView: {
    flex: 1,
  },
  dropdown: {
    borderColor: '#ddd',
    borderRadius: 8,
    minHeight: 50,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  dropdownContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderColor: '#ddd',
  },
  modalContentContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 15,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemLabel: {
    fontSize: 16,
    color: '#333',
  },
  listItemContainer: {
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  selectedItemContainer: {
    backgroundColor: '#F5F9FF',
  },
  selectedItemLabel: {
    color: '#2196F3',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 4,
  },
  confessionFatherContainer: {
    marginTop: 10,
  },
  buttonWrapper: {
    backgroundColor: '#FFF',
    paddingTop: 20,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 50,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE',
  },
  selectedOption: {
    backgroundColor: '#F5F9FF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  photoUploadButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  uploadText: {
    color: '#666',
    fontSize: 16,
    marginTop: 8,
  },
  photoPreviewContainer: {
    position: 'relative',
    height: 200,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});