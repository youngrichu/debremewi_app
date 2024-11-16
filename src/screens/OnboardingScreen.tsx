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
import { useTranslation } from 'react-i18next';

const STEPS = [
  'welcome',
  'personal',
  'contact',
  'church',
  'additional'
];

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: string;
  residencyCity?: string;
  christianName?: string;
  maritalStatus?: string;
  hasChildren?: string;
  numberOfChildren?: string;
  christianLife?: string;
  serviceAtParish?: string;
  ministryService?: string;
  confessionFather?: string;
  residenceAddress?: string;
  educationLevel?: string;
  occupation?: string;
  residencePermit?: string;
  emergencyContact?: string;
  photo?: string;
  hasFatherInFaith?: string;
  fatherInFaithName?: string;
  hasAssociationMembership?: string;
  hasFatherConfessor?: string;
  fatherConfessorName?: string;
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

// Remove the static SERVICE_AT_PARISH_OPTIONS constant and add this function:
const getServiceAtParishOptions = (t: any): DropdownOption[] => [
  { label: t('profile.selects.selectServiceType'), value: 'sub_department', disabled: true },
  { label: t('profile.options.serviceAtParish.priesthood'), value: 'priesthood' },
  { label: t('profile.options.serviceAtParish.deacon'), value: 'deacon' },
  { label: t('profile.options.serviceAtParish.choir'), value: 'choir' },
  { label: t('profile.options.serviceAtParish.sunday_school'), value: 'sunday_school' },
  { label: t('profile.options.serviceAtParish.council'), value: 'council' },
  { label: t('profile.options.serviceAtParish.chalice_association'), value: 'chalice_association' },
  { label: t('profile.options.serviceAtParish.parents'), value: 'parents' },
  { label: t('profile.options.serviceAtParish.childrens_department'), value: 'childrens_department' },
  { label: t('common.none'), value: 'none' }
];

export const MINISTRY_SERVICE_OPTIONS: DropdownOption[] = [
  { label: 'Select a Sub-department Service', value: 'sub_department', disabled: true },
  { label: "Gospel", value: 'gospel' },
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

// Update the DropdownState interface
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

export default function OnboardingScreen() {
  const { t } = useTranslation();
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
  const [isAnyDropdownOpen, setIsAnyDropdownOpen] = useState(false);
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [openDropdowns, setOpenDropdowns] = useState<DropdownState>({
    gender: false,
    maritalStatus: false,
    educationLevel: false,
    residencyCity: false,
    christianLife: false,
    serviceAtParish: false,
    ministryService: false,
    hasFatherConfessor: false,
    hasAssociationMembership: false,
    residencePermit: false,
    hasChildren: false
  });
  const serviceAtParishOptions = getServiceAtParishOptions(t);

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
    const newErrors: FormErrors = {
      christianName: '',
      residenceAddress: '',
      hasFatherInFaith: '',
      fatherInFaithName: '',
      hasAssociationMembership: '',
      hasFatherConfessor: '',
      fatherConfessorName: ''
    };
    
    switch (step) {
      case 1: // Personal Info
        if (!formData.firstName?.trim()) {
          newErrors.firstName = t('validation.required.firstName');
        }
        if (!formData.lastName?.trim()) {
          newErrors.lastName = t('validation.required.lastName');
        }
        if (!formData.gender) {
          newErrors.gender = t('validation.required.gender');
        }
        break;

      case 2: // Contact Info
        if (!formData.phoneNumber?.trim()) {
          newErrors.phoneNumber = t('validation.required.phoneNumber');
        }
        if (!formData.residencyCity) {
          newErrors.residencyCity = t('validation.required.city');
        }
        if (!formData.residenceAddress?.trim()) {
          newErrors.residenceAddress = t('validation.required.address');
        }
        break;

      // ... other validation cases remain the same ...
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
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
                {t(`onboarding.steps.${step}`)}
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>{t('onboarding.sections.personalInfo')}</Text>
            <Text style={styles.helperText}>{t('onboarding.helpers.personalInfo')}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.firstName')} <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[
                  styles.input as object,
                  errors.firstName && (styles.inputError as object)
                ]}
                value={formData.firstName}
                onChangeText={(text) => handleChange('firstName', text)}
                placeholder={t('profile.placeholders.enterFirstName')}
              />
              {errors.firstName && <Text style={styles.errorText}>{t('validation.required.firstName')}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.lastName')} <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[
                  styles.input as object,
                  errors.lastName && (styles.inputError as object)
                ]}
                value={formData.lastName}
                onChangeText={(text) => handleChange('lastName', text)}
                placeholder={t('profile.placeholders.enterLastName')}
              />
              {errors.lastName && <Text style={styles.errorText}>{t('validation.required.lastName')}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.christianName')}</Text>
              <TextInput
                style={[
                  styles.input as object,
                  errors.christianName && (styles.inputError as object)
                ]}
                value={formData.christianName}
                onChangeText={(text) => handleChange('christianName', text)}
                placeholder={t('profile.placeholders.enterChristianName')}
              />
              {errors.christianName && <Text style={styles.errorText}>{t('validation.required.christianName')}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.gender')}</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('gender')}
              >
                <Text style={[styles.pickerButtonText, !formData.gender && { color: '#666' }]}>
                  {formData.gender ? getPickerDisplayValue('gender', formData.gender) : t('common.select')}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, { zIndex: 4000 }]}>
              <Text style={styles.label}>{t('profile.fields.maritalStatus')}</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('maritalStatus')}
              >
                <Text style={[styles.pickerButtonText, !formData.maritalStatus && { color: '#666' }]}>
                  {formData.maritalStatus ? getPickerDisplayValue('maritalStatus', formData.maritalStatus) : t('common.select')}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, { zIndex: 3000 }]}>
              <Text style={styles.label}>{t('profile.fields.educationLevel')}</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => {
                  console.log('Opening education picker');
                  setOpenPicker('educationLevel');
                }}
              >
                <Text style={[styles.pickerButtonText, !formData.educationLevel && { color: '#666' }]}>
                  {formData.educationLevel ? getPickerDisplayValue('educationLevel', formData.educationLevel) : t('common.select')}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.hasChildren')}</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('hasChildren')}
              >
                <Text style={[styles.pickerButtonText, !formData.hasChildren && { color: '#666' }]}>
                  {formData.hasChildren ? getPickerDisplayValue('hasChildren', formData.hasChildren) : t('common.select')}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Conditional rendering for number of children */}
            {formData.hasChildren === 'yes' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('profile.fields.numberOfChildren')}</Text>
                <TextInput
                  style={[
                    styles.input as object,
                    errors.numberOfChildren && (styles.inputError as object)
                  ]}
                  value={formData.numberOfChildren}
                  onChangeText={(text) => handleChange('numberOfChildren', text)}
                  placeholder={t('profile.placeholders.enterNumberOfChildren')}
                  keyboardType="numeric"
                />
                {errors.numberOfChildren && <Text style={styles.errorText}>{t('validation.required.numberOfChildren')}</Text>}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.occupation')}</Text>
              <TextInput
                style={[
                  styles.input as object,
                  errors.occupation && (styles.inputError as object)
                ]}
                value={formData.occupation}
                onChangeText={(text) => handleChange('occupation', text)}
                placeholder={t('profile.placeholders.enterOccupation')}
              />
              {errors.occupation && <Text style={styles.errorText}>{t('validation.required.occupation')}</Text>}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>{t('onboarding.sections.contactInfo')}</Text>
            <Text style={styles.helperText}>{t('onboarding.helpers.contactInfo')}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.phoneNumber')} <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[
                  styles.input as object,
                  errors.phoneNumber && (styles.inputError as object)
                ]}
                value={formData.phoneNumber}
                onChangeText={(text) => handleChange('phoneNumber', text)}
                placeholder={t('profile.placeholders.enterPhoneNumber')}
                keyboardType="phone-pad"
              />
              {errors.phoneNumber && <Text style={styles.errorText}>{t('validation.required.phoneNumber')}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.residencyCity')}</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('residencyCity')}
              >
                <Text style={[styles.pickerButtonText, !formData.residencyCity && { color: '#666' }]}>
                  {formData.residencyCity ? 
                    getPickerDisplayValue('residencyCity', formData.residencyCity) : 
                    t('profile.selects.selectCity')
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.residenceAddress')}</Text>
              <Text style={styles.helperText}>{t('profile.helpers.residenceAddress')}</Text>
              <TextInput
                style={[
                  styles.input as object,
                  errors.residenceAddress && (styles.inputError as object)
                ]}
                value={formData.residenceAddress}
                onChangeText={(text) => handleChange('residenceAddress', text)}
                placeholder={t('profile.placeholders.enterResidenceAddress')}
                multiline
              />
              {errors.residenceAddress && <Text style={styles.errorText}>{t('validation.required.residenceAddress')}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.emergencyContact')}</Text>
              <Text style={styles.helperText}>{t('profile.helpers.emergencyContact')}</Text>
              <TextInput
                style={[
                  styles.input as object,
                  errors.emergencyContact && (styles.inputError as object)
                ]}
                value={formData.emergencyContact}
                onChangeText={(text) => handleChange('emergencyContact', text)}
                placeholder={t('profile.placeholders.enterEmergencyContact')}
                multiline
              />
              {errors.emergencyContact && <Text style={styles.errorText}>{t('validation.required.emergencyContact')}</Text>}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>{t('onboarding.sections.churchInfo')}</Text>
            <Text style={styles.helperText}>{t('onboarding.helpers.churchInfo')}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.serviceAtParish')}</Text>
              <Text style={styles.helperText}>{t('profile.helpers.serviceAtParish')}</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('serviceAtParish')}
              >
                <Text style={[styles.pickerButtonText, !formData.serviceAtParish && { color: '#666' }]}>
                  {formData.serviceAtParish ? 
                    getPickerDisplayValue('serviceAtParish', formData.serviceAtParish) : 
                    t('profile.selects.selectServiceType')
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Conditional Sub-department Service dropdown */}
            {formData.serviceAtParish && formData.serviceAtParish !== 'none' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('profile.fields.ministryService')}</Text>
                <Text style={styles.helperText}>{t('profile.helpers.ministryService')}</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setOpenPicker('ministryService')}
                >
                  <Text style={[styles.pickerButtonText, !formData.ministryService && { color: '#666' }]}>
                    {formData.ministryService ? getPickerDisplayValue('ministryService', formData.ministryService) : t('common.select')}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.hasFatherConfessor')}</Text>
              <Text style={styles.helperText}>{t('profile.helpers.hasFatherConfessor')}</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('hasFatherConfessor')}
              >
                <Text style={[styles.pickerButtonText, !formData.hasFatherConfessor && { color: '#666' }]}>
                  {formData.hasFatherConfessor ? getPickerDisplayValue('hasFatherConfessor', formData.hasFatherConfessor) : t('common.select')}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {formData.hasFatherConfessor === 'yes' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('profile.fields.fatherConfessorName')}</Text>
                <TextInput
                  style={[
                    styles.input as object,
                    errors.fatherConfessorName && (styles.inputError as object)
                  ]}
                  value={formData.fatherConfessorName}
                  onChangeText={(text) => handleChange('fatherConfessorName', text)}
                  placeholder={t('profile.placeholders.enterFatherConfessorName')}
                />
                {errors.fatherConfessorName && <Text style={styles.errorText}>{t('validation.required.fatherConfessorName')}</Text>}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.hasAssociationMembership')}</Text>
              <Text style={styles.helperText}>{t('profile.helpers.hasAssociationMembership')}</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('hasAssociationMembership')}
              >
                <Text style={[styles.pickerButtonText, !formData.hasAssociationMembership && { color: '#666' }]}>
                  {formData.hasAssociationMembership ? getPickerDisplayValue('hasAssociationMembership', formData.hasAssociationMembership) : t('common.select')}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {formData.hasAssociationMembership === 'yes' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('profile.fields.associationName')}</Text>
                <TextInput
                  style={[
                    styles.input as object,
                    errors.associationName && (styles.inputError as object)
                  ]}
                  value={formData.associationName}
                  onChangeText={(text) => handleChange('associationName', text)}
                  placeholder={t('profile.placeholders.enterAssociationName')}
                />
                {errors.associationName && <Text style={styles.errorText}>{t('validation.required.associationName')}</Text>}
              </View>
            )}
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>{t('onboarding.sections.additionalInfo')}</Text>
            <Text style={styles.helperText}>{t('onboarding.helpers.additionalInfo')}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.photo')}</Text>
              <Text style={styles.helperText}>{t('profile.helpers.photo')}</Text>
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
                    <Text style={styles.uploadText}>{t('common.uploadPhoto')}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.residencePermit')}</Text>
              <Text style={styles.helperText}>{t('profile.helpers.residencePermit')}</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('residencePermit')}
              >
                <Text style={[styles.pickerButtonText, !formData.residencePermit && { color: '#666' }]}>
                  {formData.residencePermit ? getPickerDisplayValue('residencePermit', formData.residencePermit) : t('common.select')}
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

  const renderWelcomeStep = () => (
    <View style={styles.welcomeContainer}>
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeTitle}>{t('onboarding.welcome.title')}</Text>
        {/* <Text style={styles.welcomeSubtitle}>
          {t('onboarding.welcome.subtitle')}
        </Text> */}
      </View>
      
      <Text style={styles.welcomeDescription}>
        {t('onboarding.welcome.description')}
      </Text>
      
      <View style={styles.welcomePoints}>
        <View style={styles.welcomePoint}>
          <Ionicons name="calendar" size={24} color="#2196F3" />
          <View style={styles.pointTextContainer}>
            <Text style={styles.pointTitle}>{t('onboarding.welcome.features.events.title')}</Text>
            <Text style={styles.pointDescription}>{t('onboarding.welcome.features.events.description')}</Text>
          </View>
        </View>

        <View style={styles.welcomePoint}>
          <Ionicons name="people" size={24} color="#2196F3" />
          <View style={styles.pointTextContainer}>
            <Text style={styles.pointTitle}>{t('onboarding.welcome.features.community.title')}</Text>
            <Text style={styles.pointDescription}>{t('onboarding.welcome.features.community.description')}</Text>
          </View>
        </View>

        <View style={styles.welcomePoint}>
          <Ionicons name="notifications" size={24} color="#2196F3" />
          <View style={styles.pointTextContainer}>
            <Text style={styles.pointTitle}>{t('onboarding.welcome.features.notifications.title')}</Text>
            <Text style={styles.pointDescription}>{t('onboarding.welcome.features.notifications.description')}</Text>
          </View>
        </View>

        <View style={styles.welcomePoint}>
          <Ionicons name="book" size={24} color="#2196F3" />
          <View style={styles.pointTextContainer}>
            <Text style={styles.pointTitle}>{t('onboarding.welcome.features.resources.title')}</Text>
            <Text style={styles.pointDescription}>{t('onboarding.welcome.features.resources.description')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const handleOpenPicker = (pickerName: keyof DropdownState) => {
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
        return serviceAtParishOptions;
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

  // Helper function to get translated display value for pickers
  const getPickerDisplayValue = (field: string, value: string | null | undefined) => {
    if (!value) return t('common.select');

    // For yes/no fields including hasChildren
    if (['hasFatherConfessor', 'hasAssociationMembership', 'residencePermit', 'hasChildren'].includes(field)) {
      return t(`profile.options.${field}.${value.toLowerCase()}`);
    }

    // For cities
    if (field === 'residencyCity') {
      return t(`profile.options.cities.${value}`);
    }

    // For all other fields
    return t(`profile.options.${field}.${value}`);
  };

  // Fix picker button rendering
  const renderPickerButton = (field: string, isRequired: boolean = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {t(`profile.fields.${field}`)} {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity 
        style={styles.pickerButton}
        onPress={() => handleOpenPicker(field as keyof DropdownState)}
      >
        <Text style={[styles.pickerButtonText, !formData[field as keyof typeof formData] && { color: '#666' }]}>
          {formData[field as keyof typeof formData] 
            ? getPickerDisplayValue(field, formData[field as keyof typeof formData])
            : t('common.select')}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

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
          <Text style={styles.headerText}>{t('onboarding.profileSetup')}</Text>
          <Text style={styles.stepIndicator}>
            {t('onboarding.stepIndicator', { current: currentStep + 1, total: STEPS.length })}
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
                    <Text style={styles.secondaryButtonText}>
                      {t('onboarding.navigation.previous')}
                    </Text>
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
                        {currentStep === STEPS.length - 1 
                          ? t('onboarding.navigation.complete')
                          : t('onboarding.navigation.next')
                        }
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
          pickerName={openPicker}
          onSelect={(value) => {
            handleChange(openPicker, value);
            setOpenPicker(null);
          }}
          selectedValue={formData[openPicker]?.toString()}
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
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  } as const,
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
    borderColor: '#FF3B30',
  } as const,
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
  stepContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  required: {
    color: '#FF3B30',
  },
});