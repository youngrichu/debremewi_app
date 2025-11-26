import React, { useState, useEffect, useRef } from 'react';
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
  Keyboard,
  Dimensions,
  InputAccessoryView,
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
import { PhoneInput } from '../components/PhoneInput';

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
  hasChildren: boolean;
}

interface UserData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  residencyCity?: string;
  residenceAddress?: string;
  christianName?: string;
  emergencyContact?: string;
  occupation?: string;
  hasChildren?: string;
  numberOfChildren?: string;
  children?: Array<{
    fullName: string;
    christianityName: string;
    gender: string;
    age: string;
  }>;
  photo?: string;
  profile_photo?: string;
  profile_photo_url?: string;
  avatar_url?: string;
  [key: string]: any;
}

interface FormData extends UserData {
  countryCode: string;
}

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
    case 'hasChildren':
      return 'Do you have children?';
    case 'hasAssociationMembership':
      return 'Are you a member of any Church Association?';
    default:
      return 'Select an Option';
  }
};

const ChildFields = React.memo(({
  index,
  child,
  handleChildFieldChange,
  errors,
  t,
  setShowPicker
}: {
  index: number;
  child: any;
  handleChildFieldChange: (index: number, field: string, value: string) => void;
  errors: any;
  t: any;
  setShowPicker: (field: string | null) => void;
}) => {
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
          value={child?.fullName || ''}
          onChangeText={(value) => handleChildFieldChange(index, 'fullName', value)}
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
          value={child?.christianityName || ''}
          onChangeText={(value) => handleChildFieldChange(index, 'christianityName', value)}
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
          onPress={() => setShowPicker(`child${index}Gender`)}
        >
          <Text style={[styles.pickerButtonText, !child?.gender && { color: '#666' }]}>
            {child?.gender ? t(`profile.options.gender.${child.gender}`) : t('common.select')}
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
          value={child?.age || ''}
          onChangeText={(value) => handleChildFieldChange(index, 'age', value)}
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

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userData } = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    countryCode: '+971',
    residencyCity: '',
    residenceAddress: '',
    christianName: '',
    emergencyContact: '',
    occupation: '',
    hasChildren: 'no',
    numberOfChildren: '',
    children: [],
    ...userData,
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const { t } = useTranslation();
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
        // Remove automatic scrolling when keyboard shows
        setInitialStepScroll(false);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setInitialStepScroll(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Ensure children array is properly initialized when numberOfChildren changes
  useEffect(() => {
    if (formData.hasChildren === 'yes' && formData.numberOfChildren) {
      const childCount = parseInt(formData.numberOfChildren);
      const currentChildren = formData.children || [];

      // Only initialize if we don't have enough children entries
      if (currentChildren.length < childCount) {
        const newChildren = [...currentChildren];
        for (let i = currentChildren.length; i < childCount; i++) {
          newChildren[i] = {
            fullName: '',
            christianityName: '',
            gender: '',
            age: ''
          };
        }
        setFormData(prev => ({ ...prev, children: newChildren }));
      }
    }
  }, [formData.hasChildren, formData.numberOfChildren]);

  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    // Remove all automatic scrolling behavior
    return;
  };

  const handleChange = (field: keyof FormData, value: any) => {
    // Special handling for children array
    if (field === 'children') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      return;
    }

    // Handle other fields
    setFormData(prev => ({
      ...prev,
      [field]: value?.trim?.() === '' ? undefined : value
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

    if (formData.hasChildren === 'yes') {
      if (!formData.numberOfChildren) {
        newErrors.numberOfChildren = t('validation.required.numberOfChildren');
      } else {
        const childCount = parseInt(formData.numberOfChildren);
        for (let i = 0; i < childCount; i++) {
          const child = formData.children?.[i];
          if (!child?.fullName?.trim()) {
            newErrors[`child${i}FullName`] = t('validation.required.childFullName');
          }
          if (!child?.christianityName?.trim()) {
            newErrors[`child${i}ChristianityName`] = t('validation.required.childChristianityName');
          }
          if (!child?.gender) {
            newErrors[`child${i}Gender`] = t('validation.required.childGender');
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        t('common.error'),
        t('profile.messages.fillRequiredFields')
      );
      return;
    }

    setLoading(true);
    try {
      const updatedProfile = {
        ...formData,
        children: formData.hasChildren === 'yes' ? formData.children : [],
      };

      console.log('Profile data being sent:', JSON.stringify(updatedProfile, null, 2));

      const response = await ProfileService.updateProfile(updatedProfile);
      dispatch(setUserData(response.data));

      Alert.alert(
        t('common.success'),
        t('profile.messages.updateSuccess')
      );
      navigation.goBack();
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert(
        t('common.error'),
        t('profile.messages.updateError')
      );
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
    if (['hasFatherConfessor', 'hasAssociationMembership'].includes(field)) {
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
  const renderFormField = (field: keyof FormData, isRequired: boolean = false) => {
    if (field === 'phoneNumber') {
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t(`profile.fields.${field}`)} {isRequired && <Text style={styles.required}>*</Text>}
          </Text>
          <PhoneInput
            value={formData.phoneNumber || ''}
            countryCode={formData.countryCode || '+971'}
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
      );
    }

    // Special handling for multiline text inputs
    if (field === 'residenceAddress' || field === 'emergencyContact') {
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t(`profile.fields.${field}`)} {isRequired && <Text style={styles.required}>*</Text>}
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
              errors[field] && styles.inputError
            ]}
            value={formData[field]?.toString() || ''}
            onChangeText={(value) => handleChange(field, value)}
            placeholder={t(`profile.placeholders.enter${field.charAt(0).toUpperCase() + field.slice(1)}`)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            blurOnSubmit={true}
            {...(Platform.OS === 'ios' ? {
              inputAccessoryViewID: 'doneButton'
            } : {})}
          />
          {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
          {field === 'emergencyContact' && (
            <Text style={styles.helperText}>
              {t('profile.helpers.emergencyContact')}
            </Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          {t(`profile.fields.${field}`)} {isRequired && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          style={[styles.input, errors[field] && styles.inputError]}
          value={formData[field]?.toString() || ''}
          onChangeText={(value) => handleChange(field, value)}
          placeholder={t(`profile.placeholders.enter${field.charAt(0).toUpperCase() + field.slice(1)}`)}
        />
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  };

  // Fix section titles
  const renderSectionTitle = (section: string) => (
    <>
      {section !== 'personalInfo' && <View style={styles.sectionSeparator} />}
      <Text style={styles.sectionTitle}>
        {t(`profile.sections.${section}`)}
      </Text>
    </>
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
    if (['hasFatherConfessor', 'hasAssociationMembership'].includes(field)) {
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

  // Add this section for children inputs
  const renderChildrenSection = () => {
    if (formData.hasChildren !== 'yes') return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('profile.sections.childrenInfo')}
        </Text>
        {formData.children?.map((child, index) => (
          <View key={index} style={styles.childContainer}>
            <Text style={styles.childTitle}>
              {t('profile.fields.child')} {index + 1}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('profile.fields.fullName')} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors[`child${index}FullName`] && styles.inputError]}
                value={child.fullName}
                onChangeText={(value) => handleChildFieldChange(index, 'fullName', value)}
                placeholder={t('profile.placeholders.enterFullName')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('profile.fields.christianityName')} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors[`child${index}ChristianityName`] && styles.inputError]}
                value={child.christianityName}
                onChangeText={(value) => handleChildFieldChange(index, 'christianityName', value)}
                placeholder={t('profile.placeholders.enterChristianityName')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('profile.fields.gender')} <Text style={styles.required}>*</Text>
              </Text>
              <CustomPicker
                visible={showPicker === `child${index}Gender`}
                onClose={() => setShowPicker(null)}
                pickerName="gender"
                selectedValue={child.gender}
                onSelect={(value) => handleChildFieldChange(index, 'gender', value)}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const handleChildFieldChange = (index: number, field: string, value: string) => {
    const updatedChildren = [...(formData.children || [])];
    if (!updatedChildren[index]) {
      updatedChildren[index] = {
        fullName: '',
        christianityName: '',
        gender: '',
        age: ''
      };
    }
    updatedChildren[index] = {
      ...updatedChildren[index],
      [field]: value
    };
    handleChange('children', updatedChildren);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.keyboardView]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
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
          bounces={false}
          keyboardDismissMode="interactive"
        >
          {/* Photo Upload Section */}
          {!keyboardVisible && (
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
          )}

          {/* Form Fields */}
          <View style={[
            styles.formSection,
            keyboardVisible && styles.formSectionWithKeyboard
          ]}>
            {/* Personal Information */}
            {renderSectionTitle('personalInfo')}
            {renderFormField('firstName', true)}
            {renderFormField('lastName', true)}
            {renderFormField('christianName')}
            {renderPickerButton('gender', true)}
            {renderPickerButton('maritalStatus')}
            {renderPickerButton('educationLevel')}
            {renderFormField('occupation')}

            {/* Children Information */}
            {renderSectionTitle('childrenInfo')}
            {renderPickerButton('hasChildren')}

            {formData.hasChildren === 'yes' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('profile.fields.numberOfChildren')} <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.numberOfChildren && styles.inputError]}
                    value={formData.numberOfChildren}
                    onChangeText={(value) => handleChange('numberOfChildren', value)}
                    keyboardType="numeric"
                    placeholder={t('profile.placeholders.enterNumberOfChildren')}
                  />
                  {errors.numberOfChildren && (
                    <Text style={styles.errorText}>{errors.numberOfChildren}</Text>
                  )}
                </View>

                {formData.numberOfChildren && parseInt(formData.numberOfChildren) > 0 && (
                  Array.from({ length: parseInt(formData.numberOfChildren) }).map((_, index) => (
                    <ChildFields
                      key={index}
                      index={index}
                      child={formData.children?.[index]}
                      handleChildFieldChange={handleChildFieldChange}
                      errors={errors}
                      t={t}
                      setShowPicker={setOpenPicker}
                    />
                  ))
                )}
              </>
            )}

            {/* Contact Information */}
            {renderSectionTitle('contactInfo')}
            {renderFormField('phoneNumber', true)}
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

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID="doneButton">
          <View style={styles.inputAccessoryContainer}>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                isPickerSelectionRef.current = false;
              }}
              style={styles.doneButton}
            >
              <Text style={styles.doneButtonText}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}

      {/* Picker Modal */}
      {openPicker && (
        <CustomPicker
          visible={true}
          onClose={() => {
            setOpenPicker(null);
            isPickerSelectionRef.current = false;
          }}
          pickerName={openPicker.includes('Gender') ? 'gender' : openPicker}
          onSelect={(value) => {
            if (openPicker.includes('child')) {
              const childIndex = parseInt(openPicker.match(/\d+/)?.[0] || '0');
              handleChildFieldChange(childIndex, 'gender', value);
            } else {
              handleChange(openPicker as keyof typeof formData, value);
            }
            setOpenPicker(null);
            isPickerSelectionRef.current = false;
          }}
          selectedValue={
            openPicker.includes('child')
              ? formData.children?.[parseInt(openPicker.match(/\d+/)?.[0] || '0')]?.gender
              : formData[openPicker as keyof typeof formData]?.toString()
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 24,
    paddingBottom: 20,
  },
  scrollContentWithKeyboard: {
    paddingTop: 0,
    paddingBottom: Platform.OS === 'ios' ? 200 : 120,
  },
  photoSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    backgroundColor: '#fff',
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
    paddingBottom: Platform.OS === 'ios' ? 100 : 60,
  },
  formSectionWithKeyboard: {
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
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
  childContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  childTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputAccessoryContainer: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#dadada',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  doneButton: {
    padding: 8,
    marginRight: 8,
  },
  doneButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionSeparator: {
    height: 12,
    backgroundColor: '#f5f5f5',
    marginHorizontal: -16,
    marginVertical: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
}); 