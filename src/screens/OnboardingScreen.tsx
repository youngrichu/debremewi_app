import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  Keyboard,
  Dimensions,
  Animated
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setUserData } from '../store/slices/userSlice';
import { ProfileService } from '../services/ProfileService';
import { CustomPicker } from '../components/CustomPicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { PhoneInput } from '../components/PhoneInput';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { validateChildrenData } from '../utils/validation';
import { LanguageSelector } from '../components/LanguageSelector';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

const STEPS = [
  { key: 'welcome' },
  { 
    key: 'personal',
    fields: [
      { name: 'firstName', type: 'text' },
      { name: 'lastName', type: 'text' },
      { name: 'christianName', type: 'text' },
      { name: 'gender', type: 'picker' },
      { name: 'birthDate', type: 'picker' },
      { name: 'maritalStatus', type: 'picker' },
      { name: 'hasChildren', type: 'picker' },
      { name: 'numberOfChildren', type: 'text' },
      { name: 'occupation', type: 'text' }
    ]
  },
  {
    key: 'contact',
    fields: [
      { name: 'phoneNumber', type: 'text' },
      { name: 'residencyCity', type: 'picker' },
      { name: 'residenceAddress', type: 'text' },
      { name: 'emergencyContact', type: 'text' }
    ]
  },
  {
    key: 'church',
    fields: [
      { name: 'christianLife', type: 'picker' },
      { name: 'hasFatherConfessor', type: 'picker' },
      { name: 'fatherConfessorName', type: 'text' },
      { name: 'serviceAtParish', type: 'picker' },
      { name: 'ministryService', type: 'picker' },
      { name: 'hasAssociationMembership', type: 'picker' },
      { name: 'associationName', type: 'text' }
    ]
  }
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

interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

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

export const HAS_CHILDREN_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' }
];

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

const ChildFields = React.memo(({ 
  index, 
  formData, 
  handleChange, 
  errors, 
  t, 
  setOpenPicker 
}: {
  index: number;
  formData: any;
  handleChange: Function;
  errors: any;
  t: any;
  setOpenPicker: (field: string) => void;
}) => {
  console.log('Rendering child fields for index:', index);
  return (
    <View key={`child-${index}`} style={styles.childContainer}>
      <Text style={styles.childTitle}>{t('profile.fields.child', { number: index + 1 })}</Text>
      
      {/* Child's Full Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {t('profile.fields.childFullName')} <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors[`child${index}FullName`] && styles.inputError]}
          value={formData.children?.[index]?.fullName || ''}
          onChangeText={(value) => {
            const updatedChildren = [...(formData.children || [])];
            if (!updatedChildren[index]) {
              updatedChildren[index] = {};
            }
            updatedChildren[index] = {
              ...updatedChildren[index],
              fullName: value
            };
            handleChange('children', updatedChildren);
          }}
          placeholder={t('profile.placeholders.enterChildFullName')}
        />
        {errors[`child${index}FullName`] && (
          <Text style={styles.errorText}>{errors[`child${index}FullName`]}</Text>
        )}
      </View>

      {/* Child's Christianity Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {t('profile.fields.childChristianityName')} <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors[`child${index}ChristianityName`] && styles.inputError]}
          value={formData.children?.[index]?.christianityName || ''}
          onChangeText={(value) => {
            const updatedChildren = [...(formData.children || [])];
            if (!updatedChildren[index]) {
              updatedChildren[index] = {};
            }
            updatedChildren[index] = {
              ...updatedChildren[index],
              christianityName: value
            };
            handleChange('children', updatedChildren);
          }}
          placeholder={t('profile.placeholders.enterChildChristianityName')}
        />
        {errors[`child${index}ChristianityName`] && (
          <Text style={styles.errorText}>{errors[`child${index}ChristianityName`]}</Text>
        )}
      </View>

      {/* Child's Gender */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {t('profile.fields.childGender')} <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => {
            console.log('Opening gender picker for child:', index);
            setOpenPicker(`child${index}Gender`);
          }}
        >
          <Text style={styles.pickerButtonText}>
            {formData.children?.[index]?.gender
              ? t(`profile.options.gender.${formData.children[index].gender}`)
              : t('common.select')}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
        {errors[`child${index}Gender`] && (
          <Text style={styles.errorText}>{errors[`child${index}Gender`]}</Text>
        )}
      </View>

      {/* Child's Age */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {t('profile.fields.childAge')} <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors[`child${index}Age`] && styles.inputError]}
          value={formData.children?.[index]?.age || ''}
          onChangeText={(value) => {
            const updatedChildren = [...(formData.children || [])];
            if (!updatedChildren[index]) {
              updatedChildren[index] = {};
            }
            updatedChildren[index] = {
              ...updatedChildren[index],
              age: value
            };
            handleChange('children', updatedChildren);
          }}
          placeholder={t('profile.placeholders.enterChildAge')}
          keyboardType="numeric"
        />
        {errors[`child${index}Age`] && (
          <Text style={styles.errorText}>{errors[`child${index}Age`]}</Text>
        )}
      </View>
    </View>
  );
});

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { height: windowHeight } = Dimensions.get('window');
  const [showNavigation, setShowNavigation] = useState(false);
  const [initialStepScroll, setInitialStepScroll] = useState(true);

  const isPickerSelectionRef = useRef(false);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    if (currentStepIndex > 0 && initialStepScroll) {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      setInitialStepScroll(false);
    }
  }, [currentStepIndex]);

  const handleStepChange = (nextStep: number) => {
    setCurrentStepIndex(nextStep);
    setInitialStepScroll(true);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    phoneNumber: string;
    countryCode: string;
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
    children?: Array<{
      fullName: string;
      christianityName: string;
      gender: string;
    }>;
  }>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    countryCode: '+971',
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
    children: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [isAnyDropdownOpen, setIsAnyDropdownOpen] = useState(false);
  const [openPicker, setOpenPicker] = useState<string | null>(null);
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

  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  const focusNextInput = (currentField: string) => {
    const step = STEPS[currentStepIndex];
    if (!step?.fields) return;

    const currentIndex = step.fields.findIndex(field => field.name === currentField);
    if (currentIndex === -1) return;

    const nextField = step.fields[currentIndex + 1];
    if (!nextField) return;

    if (nextField.type === 'text') {
      inputRefs.current[nextField.name]?.focus();
    } else if (nextField.type === 'picker') {
      Keyboard.dismiss();
      handleDropdownOpen(nextField.name as keyof DropdownState);
    } else {
      Keyboard.dismiss();
    }
  };

  const getReturnKeyType = (fieldName: string) => {
    const step = STEPS[currentStepIndex];
    if (!step?.fields) return 'done';

    const currentIndex = step.fields.findIndex(field => field.name === fieldName);
    if (currentIndex === -1 || currentIndex === step.fields.length - 1) return 'done';
    
    return 'next';
  };

  const handleInputSubmit = (fieldName: string) => {
    focusNextInput(fieldName);
  };

  const handleDropdownOpen = (dropdownName: keyof DropdownState) => {
    isPickerSelectionRef.current = true;
    
    setOpenDropdowns(prev => {
      const allClosed = Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: key === dropdownName ? !prev[key as keyof DropdownState] : false
      }), {} as DropdownState);
      return allClosed;
    });
  };

  const handleDropdownClose = () => {
    setTimeout(() => {
      isPickerSelectionRef.current = false;
    }, 500);
  };

  const getNextTextInputField = (currentField: string) => {
    const step = STEPS[currentStepIndex];
    if (!step?.fields) return null;

    const fields = step.fields;
    const currentFieldIndex = fields.findIndex(f => f.name === currentField);
    
    for (let i = currentFieldIndex + 1; i < fields.length; i++) {
      if (fields[i].type === 'text') {
        return fields[i].name;
      }
    }
    return null;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.firstName?.trim()) {
          newErrors.firstName = t('validation.required.firstName');
        }
        if (!formData.lastName?.trim()) {
          newErrors.lastName = t('validation.required.lastName');
        }
        if (!formData.gender) {
          newErrors.gender = t('validation.required.gender');
        }
        if (formData.hasChildren === 'yes') {
          if (!formData.numberOfChildren) {
            newErrors.numberOfChildren = t('validation.required.numberOfChildren');
          } else {
            const numChildren = parseInt(formData.numberOfChildren);
            if (numChildren > 0) {
              for (let i = 0; i < numChildren; i++) {
                if (!formData.children?.[i]?.fullName) {
                  newErrors[`child${i}FullName`] = t('validation.required.childFullName');
                }
                if (!formData.children?.[i]?.christianityName) {
                  newErrors[`child${i}ChristianityName`] = t('validation.required.childChristianityName');
                }
                if (!formData.children?.[i]?.gender) {
                  newErrors[`child${i}Gender`] = t('validation.required.childGender');
                }
              }
            }
          }
        }
        break;

      case 2:
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

      case 3:
        if (formData.serviceAtParish && formData.serviceAtParish !== 'none' && !formData.ministryService) {
          newErrors.ministryService = t('validation.required.ministryService');
        }
        break;

      // ... other validation cases remain the same ...
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleNext = () => {
    if (currentStepIndex === 0) {
      handleStepChange(1);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      }, 100);
      return;
    }

    if (validateStep(currentStepIndex)) {
      handleStepChange(Math.min(currentStepIndex + 1, STEPS.length - 1));
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      }, 100);
    } else {
      Alert.alert(
        'Required Fields',
        'Please fill in all required fields before proceeding.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePrevious = () => {
    handleStepChange(Math.max(currentStepIndex - 1, 0));
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }, 100);
  };

  const validateChildren = () => {
    const { isValid, errorKey } = validateChildrenData(
      formData.hasChildren,
      formData.numberOfChildren,
      formData.children
    );

    if (!isValid && errorKey) {
      setErrors(prev => ({
        ...prev,
        children: t(errorKey)
      }));
    }

    return isValid;
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const formattedData = {
        ...formData,
        has_children: formData.hasChildren,
        number_of_children: formData.numberOfChildren,
        children: formData.hasChildren === 'yes' ? 
          formData.children?.map(child => ({
            fullName: child.fullName,
            christianityName: child.christianityName,
            gender: child.gender
          })) : 
          [],
        is_onboarding_complete: true,
        isOnboardingComplete: true
      };

      const updatedProfile = await ProfileService.updateProfile(formattedData);
      
      if (updatedProfile.success) {
        dispatch(setUserData({
          ...updatedProfile.data,
          isOnboardingComplete: true,
          is_onboarding_complete: true
        }));
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Handle 401 error specifically
      if (error?.response?.status === 401) {
        Alert.alert(
          t('common.error'),
          t('onboarding.errors.sessionExpired'),
          [
            {
              text: 'OK',
              onPress: () => {
                signOut(); // Sign out user and redirect to login
              }
            }
          ]
        );
      } else {
        Alert.alert(
          t('common.error'),
          t('onboarding.errors.submission')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStepIndex)) return;
    
    if (currentStepIndex === 1 && formData.hasChildren === 'yes') {
      if (!validateChildren()) {
        return;
      }
    }

    setLoading(true);
    try {
      const formattedData = {
        ...formData,
        has_children: formData.hasChildren,
        number_of_children: formData.numberOfChildren,
        children: formData.hasChildren === 'yes' ? 
          formData.children?.map(child => ({
            fullName: child.fullName,
            christianityName: child.christianityName,
            gender: child.gender
          })) : 
          []
      };

      const response = await ProfileService.updateProfile(formattedData);
      
      if (response.success) {
        dispatch(setUserData(response.data));
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Handle 401 error specifically
      if (error?.response?.status === 401) {
        Alert.alert(
          t('common.error'),
          t('onboarding.errors.sessionExpired'),
          [
            {
              text: 'OK',
              onPress: () => {
                signOut(); // Sign out user and redirect to login
              }
            }
          ]
        );
      } else {
        Alert.alert(
          t('common.error'),
          t('onboarding.errors.submission')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handlePhoneChange = (phoneNumber: string, countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: phoneNumber,
      countryCode: countryCode
    }));
    if (errors.phoneNumber) {
      setErrors(prev => ({ ...prev, phoneNumber: undefined }));
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    handleChange('phoneNumber', value);
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
                  index <= currentStepIndex ? styles.progressStepCompleted : null
                ]}
              >
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <Text style={[
                styles.progressStepText,
                index === currentStepIndex && styles.progressStepTextActive
              ]}>
                {t(`onboarding.steps.${step.key}`)}
              </Text>
            </View>
            {index < STEPS.length - 1 && (
              <View 
                style={[
                  styles.progressLine,
                  index < currentStepIndex ? styles.progressLineCompleted : null
                ]} 
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStepIndex) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>{t('onboarding.sections.personalInfo')}</Text>
            <Text style={styles.helperText}>{t('onboarding.helpers.personalInfo')}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('profile.fields.firstName')} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                value={formData.firstName || ''}
                onChangeText={(value) => {
                  setFormData({
                    ...formData,
                    firstName: value
                  });
                }}
                placeholder={t('profile.placeholders.enterFirstName')}
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('profile.fields.lastName')} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                value={formData.lastName || ''}
                onChangeText={(value) => {
                  setFormData({
                    ...formData,
                    lastName: value
                  });
                }}
                placeholder={t('profile.placeholders.enterLastName')}
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('profile.fields.christianName')}
              </Text>
              <TextInput
                style={[styles.input, errors.christianName && styles.inputError]}
                value={formData.christianName || ''}
                onChangeText={(value) => {
                  setFormData({
                    ...formData,
                    christianName: value
                  });
                }}
                placeholder={t('profile.placeholders.enterChristianName')}
              />
              {errors.christianName && <Text style={styles.errorText}>{errors.christianName}</Text>}
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

            {/* Marital Status */}
            <View style={[styles.inputGroup, { zIndex: 4000 }]}>
              <Text style={styles.label}>{t('profile.fields.maritalStatus')} <Text style={styles.required}>*</Text></Text>
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

            {/* Education Level */}
            <View style={[styles.inputGroup, { zIndex: 3000 }]}>
              <Text style={styles.label}>{t('profile.fields.educationLevel')} <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('educationLevel')}
              >
                <Text style={[styles.pickerButtonText, !formData.educationLevel && { color: '#666' }]}>
                  {formData.educationLevel ? getPickerDisplayValue('educationLevel', formData.educationLevel) : t('common.select')}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Has Children */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.hasChildren')} <Text style={styles.required}>*</Text></Text>
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

            {/* Children Fields */}
            {formData.hasChildren === 'yes' && (
              <>
                {renderInput('numberOfChildren', t('profile.placeholders.enterNumberOfChildren'), true)}
                
                {formData.numberOfChildren && parseInt(formData.numberOfChildren) > 0 && (
                  Array.from({ length: parseInt(formData.numberOfChildren) }).map((_, index) => (
                    <ChildFields
                      key={index}
                      index={index}
                      formData={formData}
                      handleChange={handleChange}
                      errors={errors}
                      t={t}
                      setOpenPicker={setOpenPicker}
                    />
                  ))
                )}
              </>
            )}

            {/* Occupation */}
            {renderInput('occupation', t('profile.placeholders.enterOccupation'))}

            {/* Profile Photo - moved to the bottom */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.photo')}</Text>
              <TouchableOpacity
                style={styles.photoUploadButton}
                onPress={pickImage}
              >
                {formData.photo ? (
                  <Image
                    source={{ uri: formData.photo }}
                    style={styles.uploadedPhoto}
                  />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="camera" size={24} color="#666" />
                    <Text style={styles.uploadPlaceholderText}>
                      {t('common.uploadPhoto')}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.helperText}>
                {t('profile.helpers.photo')}
              </Text>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>{t('onboarding.sections.contactInfo')}</Text>
            <Text style={styles.helperText}>{t('onboarding.helpers.contactInfo')}</Text>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('profile.fields.phoneNumber')} <Text style={styles.required}>*</Text>
              </Text>
              <PhoneInput
                value={formData.phoneNumber}
                countryCode={formData.countryCode}
                onChangePhoneNumber={(phoneNumber, countryCode) => {
                  setFormData(prev => ({
                    ...prev,
                    phoneNumber,
                    countryCode
                  }));
                }}
                error={errors.phoneNumber}
                returnKeyType="next"
              />
              {errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}
            </View>

            {/* Residency City */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.residencyCity')} <Text style={styles.required}>*</Text></Text>
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

            {/* Residence Address */}
            {renderInput('residenceAddress', t('profile.placeholders.enterResidenceAddress'), true, true)}

            {/* Emergency Contact */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('profile.fields.emergencyContact')}
              </Text>
              <TextInput
                ref={ref => inputRefs.current['emergencyContact'] = ref}
                style={[
                  styles.input, 
                  styles.multilineInput,
                  errors.emergencyContact && styles.inputError
                ]}
                value={formData.emergencyContact}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                onChangeText={(value) => handleChange('emergencyContact', value)}
                placeholder={t('profile.placeholders.enterEmergencyContact')}
              />
              {errors.emergencyContact && (
                <Text style={styles.errorText}>{errors.emergencyContact}</Text>
              )}
              <Text style={styles.helperText}>
                {t('profile.helpers.emergencyContact')}
              </Text>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>{t('onboarding.sections.churchInfo')}</Text>
            <Text style={styles.helperText}>{t('onboarding.helpers.churchInfo')}</Text>

            {/* Christian Life */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('profile.fields.christianLife')}
              </Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('christianLife')}
              >
                <Text style={[styles.pickerButtonText, !formData.christianLife && { color: '#666' }]}>
                  {formData.christianLife ? 
                    t(`profile.options.christianLife.${formData.christianLife}`) : 
                    t('profile.selects.selectChristianLife')}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {errors.christianLife && (
                <Text style={styles.errorText}>{errors.christianLife}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.hasFatherConfessor')}</Text>
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
                  ref={ref => inputRefs.current['fatherConfessorName'] = ref}
                  style={[
                    styles.input as object,
                    errors.fatherConfessorName && (styles.inputError as object)
                  ]}
                  value={formData.fatherConfessorName}
                  onChangeText={(text) => handleChange('fatherConfessorName', text)}
                  placeholder={t('profile.placeholders.enterFatherConfessorName')}
                  returnKeyType="done"
                  onSubmitEditing={() => focusNextInput('fatherConfessorName')}
                  blurOnSubmit={true}
                />
                {errors.fatherConfessorName && <Text style={styles.errorText}>{t('validation.required.fatherConfessorName')}</Text>}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('profile.fields.hasAssociationMembership')}</Text>
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
                  ref={ref => inputRefs.current['associationName'] = ref}
                  style={[
                    styles.input as object,
                    errors.associationName && (styles.inputError as object)
                  ]}
                  value={formData.associationName}
                  onChangeText={(text) => handleChange('associationName', text)}
                  placeholder={t('profile.placeholders.enterAssociationName')}
                  returnKeyType="done"
                  onSubmitEditing={() => focusNextInput('associationName')}
                  blurOnSubmit={true}
                />
                {errors.associationName && <Text style={styles.errorText}>{t('validation.required.associationName')}</Text>}
              </View>
            )}

            {/* Service at Parish */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('profile.fields.serviceAtParish')}
              </Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setOpenPicker('serviceAtParish')}
              >
                <Text style={[styles.pickerButtonText, !formData.serviceAtParish && { color: '#666' }]}>
                  {formData.serviceAtParish ? 
                    t(`profile.options.serviceAtParish.${formData.serviceAtParish}`) : 
                    t('profile.selects.selectServiceType')}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {errors.serviceAtParish && (
                <Text style={styles.errorText}>{errors.serviceAtParish}</Text>
              )}
            </View>

            {/* Ministry Service - Only show if serviceAtParish is selected and not 'none' */}
            {formData.serviceAtParish && formData.serviceAtParish !== 'none' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {t('profile.fields.ministryService')}
                </Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setOpenPicker('ministryService')}
                >
                  <Text style={[styles.pickerButtonText, !formData.ministryService && { color: '#666' }]}>
                    {formData.ministryService ? 
                      t(`profile.options.ministryService.${formData.ministryService}`) : 
                      t('profile.selects.selectMinistryService')}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
                {errors.ministryService && (
                  <Text style={styles.errorText}>{errors.ministryService}</Text>
                )}
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
              <Text style={styles.inputGroupHelperText}>{t('profile.helpers.photo')}</Text>
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
              <Text style={styles.inputGroupHelperText}>{t('profile.helpers.residencePermit')}</Text>
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

  const handleOpenPicker = (field: keyof typeof formData) => {
    Keyboard.dismiss();
    setOpenPicker(field);
  };

  const getPickerOptions = (field: string) => {
    switch (field) {
      case 'gender':
        return [
          { label: t('common.select'), value: '', disabled: true },
          { label: t('profile.options.gender.male'), value: 'male' },
          { label: t('profile.options.gender.female'), value: 'female' }
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
        return FATHER_CONFESSOR_OPTIONS;
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
    if (pickerName.startsWith('child') && pickerName.endsWith('Gender')) {
      return t('profile.fields.childGender');
    }

    switch (pickerName) {
      case 'gender':
        return t('profile.selects.selectGender');
      case 'maritalStatus':
        return t('profile.selects.selectMaritalStatus');
      case 'educationLevel':
        return t('profile.selects.selectEducationLevel');
      case 'residencyCity':
        return t('profile.selects.selectCity');
      case 'christianLife':
        return t('profile.selects.selectChristianLife');
      case 'serviceAtParish':
        return t('profile.selects.selectServiceType');
      case 'hasFatherConfessor':
        return t('profile.fields.hasFatherConfessor');
      case 'residencePermit':
        return t('profile.fields.residencePermit');
      case 'hasChildren':
        return t('profile.fields.hasChildren');
      case 'ministryService':
        return t('profile.selects.selectMinistryService');
      case 'hasAssociationMembership':
        return t('profile.fields.hasAssociationMembership');
      case 'hasFatherInFaith':
        return t('profile.fields.hasFatherInFaith');
      default:
        return '';
    }
  };

  const pickImage = async () => {
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

  const getPickerDisplayValue = (field: string, value: string | null | undefined) => {
    if (!value) return t('common.select');

    if (['hasFatherConfessor', 'hasAssociationMembership', 'residencePermit', 'hasChildren'].includes(field)) {
      return t(`profile.options.${field}.${value.toLowerCase()}`);
    }

    if (field === 'residencyCity') {
      return t(`profile.options.cities.${value}`);
    }

    return t(`profile.options.${field}.${value}`);
  };

  const renderPickerButton = (field: string, isRequired: boolean = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {t(`profile.fields.${field}`)} {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity 
        style={styles.pickerButton}
        onPress={() => handleOpenPicker(field as keyof typeof formData)}
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

  const renderInput = (
    field: keyof typeof formData,
    placeholder: string,
    isRequired: boolean = false,
    multiline: boolean = false
  ) => {
    const error = errors[field];
    const nextField = getNextTextInputField(field);

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {t(`profile.fields.${field}`)} {isRequired && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          ref={ref => inputRefs.current[field] = ref}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            error && styles.inputError
          ]}
          value={formData[field] || ''}
          onChangeText={(value) => {
            setFormData({
              ...formData,
              [field]: value
            });
          }}
          placeholder={placeholder}
          placeholderTextColor="#666"
          returnKeyType={nextField ? 'next' : 'done'}
          onSubmitEditing={() => handleInputSubmit(field)}
          blurOnSubmit={!multiline}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? "top" : "center"}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    if (scrollViewRef.current && !keyboardVisible && currentStepIndex > 0 && !isPickerSelectionRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
      scrollViewRef.current.scrollTo({ y: contentHeight - windowHeight + 250, animated: true });
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;

    if (currentStepIndex === 0) {
      setShowNavigation(isCloseToBottom);
    } else {
      setShowNavigation(true);
    }
  };

  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.gradient}
      >
        {!keyboardVisible && (
          <>
            <View style={styles.header}>
              <Text style={styles.headerText}>{t('onboarding.profileSetup')}</Text>
              <Text style={styles.stepIndicator}>
                {t('onboarding.stepIndicator', { current: currentStepIndex + 1, total: STEPS.length })}
              </Text>
            </View>

            {renderProgressBar()}
          </>
        )}

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.keyboardView,
            keyboardVisible && styles.keyboardViewWithKeyboard
          ]}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.content}
            contentContainerStyle={[
              styles.scrollContent,
              keyboardVisible && styles.scrollContentWithKeyboard
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            onContentSizeChange={handleContentSizeChange}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {renderStepContent()}
            <View style={{ height: Platform.OS === 'ios' ? 100 : 120 }} />
          </ScrollView>

          {!keyboardVisible && showNavigation && (
            <Animated.View 
              style={[
                styles.navigationContainer,
                {
                  transform: [{
                    translateY: showNavigation ? 0 : 100
                  }]
                }
              ]}
            >
              <View style={styles.navigationButtons}>
                {currentStepIndex > 0 && (
                  <TouchableOpacity
                    onPress={handlePrevious}
                    style={[styles.navigationButton, styles.backButton]}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-back" size={18} color="#2196F3" />
                    <Text style={styles.backButtonText}>{t('onboarding.navigation.previous')}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={currentStepIndex === STEPS.length - 1 ? handleComplete : handleNext}
                  style={[styles.navigationButton, styles.nextButton, loading && styles.buttonDisabled]}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.nextButtonText}>
                        {currentStepIndex === STEPS.length - 1
                          ? t('onboarding.navigation.finish')
                          : t('onboarding.navigation.next')}
                      </Text>
                      {currentStepIndex < STEPS.length - 1 && (
                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                      )}
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </KeyboardAvoidingView>

        {openPicker && (
          <CustomPicker
            visible={true}
            onClose={() => {
              isPickerSelectionRef.current = false;
              setOpenPicker(null);
            }}
            pickerName={
              openPicker.startsWith('child') && openPicker.endsWith('Gender')
                ? 'gender'
                : openPicker
            }
            onSelect={(value) => {
              console.log('Selected value:', value);
              isPickerSelectionRef.current = true;
              if (openPicker.startsWith('child') && openPicker.endsWith('Gender')) {
                const childIndex = parseInt(openPicker.replace('child', '').replace('Gender', ''));
                console.log('Child index:', childIndex);
                const updatedChildren = [...(formData.children || [])];
                if (!updatedChildren[childIndex]) {
                  updatedChildren[childIndex] = {};
                }
                updatedChildren[childIndex] = {
                  ...updatedChildren[childIndex],
                  gender: value
                };
                console.log('Updated children:', updatedChildren);
                handleChange('children', updatedChildren);
              } else {
                handleChange(openPicker as keyof typeof formData, value);
              }
              setOpenPicker(null);
              setTimeout(() => {
                isPickerSelectionRef.current = false;
              }, 100);
            }}
            selectedValue={
              openPicker.startsWith('child') && openPicker.endsWith('Gender')
                ? formData.children?.[parseInt(openPicker.replace('child', '').replace('Gender', ''))]?.gender
                : formData[openPicker as keyof typeof formData]?.toString()
            }
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
  keyboardViewWithKeyboard: {
    marginTop: 0, 
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 24,
    paddingBottom: 20, 
  },
  scrollContentWithKeyboard: {
    paddingTop: 0,
    paddingBottom: 40,
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
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  nextButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputGroupHelperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
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
    borderColor: '#FF3B30',
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
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
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
    paddingBottom: 40,
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  uploadedPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPlaceholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  textField: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  phoneInputContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  phoneInputTextContainer: {
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pickerScrollContent: {
    paddingBottom: 40,
  }
});