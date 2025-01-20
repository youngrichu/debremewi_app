import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ProfileScreenNavigationProp } from '../types';
import { setUserData } from '../store/slices/userSlice';
import { setAuthState } from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteAccount } from '../services/AuthService';
import { useTranslation } from 'react-i18next';
import { ProfileService } from '../services/ProfileService';
import * as ImagePicker from 'expo-image-picker';

const formatDisplayValue = (value: string | null | undefined, options?: { [key: string]: string }) => {
  if (!value) return 'Not provided';
  
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

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const user = useSelector((state: RootState) => state.user.userData);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renderChildrenList = (children?: ChildInfo[]) => {
    if (!children || children.length === 0) return null;
    
    return children.map((child, index) => (
      <View key={index} style={styles.childItem}>
        <Text style={styles.childName}>{child.fullName}</Text>
        <View style={styles.childDetailsContainer}>
          <Text style={styles.childDetail}>
            {t('profile.view.labels.christianName')}: {child.christianityName}
          </Text>
          <Text style={styles.childDetail}>
            {t('profile.view.labels.gender')}: {t(`profile.options.gender.${child.gender}`)}
          </Text>
          <Text style={styles.childDetail}>
            {t('profile.view.labels.age')}: {child.age}
          </Text>
        </View>
      </View>
    ));
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const profileData = await ProfileService.getProfile();
        console.log('Fetched Profile Data:', profileData); // Debug log
        if (profileData) {
          dispatch(setUserData(profileData));
        } else {
          setError('No profile data received');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch profile');
        Alert.alert(
          t('common.error'),
          t('profile.messages.fetchError')
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [dispatch, t]);

  // Add a retry function
  const handleRetry = () => {
    fetchProfileData();
  };

  console.log('Full User Data:', user);
  console.log('Photo Fields:', {
    photo: user?.photo,
    profile_photo: user?.profile_photo,
    profile_photo_url: user?.profile_photo_url,
    avatar_url: user?.avatar_url,
    firstName: user?.firstName
  });

  const handleEditPress = () => {
    navigation.navigate('HomeStack', {
      screen: 'EditProfile'
    });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      dispatch(setUserData({}));
      dispatch(setAuthState({ isAuthenticated: false, token: null }));
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(t('common.error'), t('profile.messages.logoutError'));
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      t('profile.view.confirmLogout.title'),
      t('profile.view.confirmLogout.message'),
      [
        { text: t('profile.view.confirmLogout.cancel'), style: 'cancel' },
        { text: t('profile.view.confirmLogout.confirm'), onPress: handleLogout, style: 'destructive' }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      dispatch(setUserData({}));
      dispatch(setAuthState({ isAuthenticated: false, token: null }));
      Alert.alert(t('profile.messages.accountDeleted'), t('profile.messages.accountDeletedSuccess'));
      navigation.navigate('Login');
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert(t('common.error'), t('profile.messages.accountDeleteError'));
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      t('profile.view.deleteAccount.title'),
      t('profile.view.deleteAccount.message'),
      [
        { text: t('profile.view.confirmLogout.cancel'), style: 'cancel' },
        { text: t('profile.view.deleteAccount.confirm'), onPress: handleDeleteAccount, style: 'destructive' }
      ]
    );
  };

  const renderDetailItem = (label: string, value: string | undefined, iconName: string, iconSet: string = 'Ionicons') => (
    <View style={styles.detailItem}>
      <View style={styles.labelContainer}>
        {iconSet === 'Ionicons' ? (
          <Ionicons name={iconName as any} size={20} color="#666" style={styles.icon} />
        ) : (
          <MaterialCommunityIcons name={iconName as any} size={20} color="#666" style={styles.icon} />
        )}
        <Text style={styles.detailLabel}>{label}:</Text>
      </View>
      <Text style={styles.detailValue}>
        {formatDisplayValue(value)}
      </Text>
    </View>
  );

  const getProfilePhoto = () => {
    if (!user) return null;
    return user.profilePhotoUrl || user.profilePhoto;
  };

  console.log('User Data:', user);
  console.log('Photo URLs:', {
    photo: user?.photo,
    profile_photo: user?.profile_photo,
    profile_photo_url: user?.profile_photo_url,
    avatar_url: user?.avatar_url
  });

  const handleChangePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(t('common.error'), t('profile.messages.permissionDenied'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        setIsLoading(true);
        try {
          const updatedProfile = await ProfileService.updateProfile({
            ...user,
            photo: result.assets[0].uri
          });
          
          if (updatedProfile.success) {
            dispatch(setUserData(updatedProfile.data));
            Alert.alert(t('common.success'), t('profile.messages.photoUpdated'));
          }
        } catch (error) {
          console.error('Error updating photo:', error);
          Alert.alert(t('common.error'), t('profile.messages.photoUpdateError'));
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), t('profile.messages.errorPickingImage'));
    }
  };

  return (
    <ScrollView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Profile Header */}
          <View style={styles.header}>
            {getProfilePhoto() ? (
              <Image 
                source={{ uri: getProfilePhoto() }} 
                style={styles.profilePhoto}
                onError={(e) => {
                  console.log('Image loading error:', e.nativeEvent.error);
                }}
              />
            ) : (
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user?.firstName?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <Text style={styles.fullName}>
              {user?.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : t('profile.messages.completeProfile')}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
              <Ionicons name="pencil" size={20} color="#FFF" />
              <Text style={styles.editButtonText}>{t('profile.editProfile')}</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.view.personalInfo')}</Text>
            {renderDetailItem(t('profile.view.labels.name'), 
              `${user?.firstName} ${user?.lastName}`, 'person-outline')}
            {renderDetailItem(t('profile.view.labels.christianName'), 
              user?.christianName, 'book-outline')}
            {renderDetailItem(t('profile.view.labels.gender'), 
              user?.gender ? t(`profile.options.gender.${user.gender}`) : '', 'male-female-outline')}
            {renderDetailItem(t('profile.view.labels.maritalStatus'), 
              user?.maritalStatus ? t(`profile.options.maritalStatus.${user.maritalStatus}`) : '', 'heart-outline')}
            {renderDetailItem(t('profile.view.labels.educationLevel'), 
              user?.educationLevel ? t(`profile.options.educationLevel.${user.educationLevel}`) : '', 'school-outline')}
            {renderDetailItem(t('profile.view.labels.occupation'), 
              user?.occupation, 'briefcase-outline')}
          </View>

          {/* Children Information Section */}
          {user?.hasChildren === 'yes' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profile.view.childrenInfo')}</Text>
              <View style={styles.detailItem}>
                <View style={styles.labelContainer}>
                  <MaterialCommunityIcons name="account-child" size={20} color="#666" style={styles.icon} />
                  <Text style={styles.detailLabel}>{t('profile.view.labels.children')}:</Text>
                </View>
                <View style={styles.childrenContainer}>
                  {renderChildrenList(user.children)}
                </View>
              </View>
            </View>
          )}

          {/* Contact Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.view.contactInfo')}</Text>
            {renderDetailItem(t('profile.view.labels.phoneNumber'), 
              user?.phoneNumber, 'call-outline')}
            {renderDetailItem(t('profile.view.labels.residencyCity'), 
              user?.residencyCity ? t(`profile.options.cities.${user.residencyCity}`) : '', 'location-outline')}
            {renderDetailItem(t('profile.view.labels.residenceAddress'), 
              user?.residenceAddress, 'home-outline')}
            {renderDetailItem(t('profile.view.labels.emergencyContact'), 
              user?.emergencyContact, 'alert-circle-outline')}
          </View>

          {/* Church Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.view.churchInfo')}</Text>
            {renderDetailItem(t('profile.view.labels.christianLife'), 
              user?.christianLife ? t(`profile.options.christianLife.${user.christianLife}`) : '', 'heart-circle-outline')}
            {renderDetailItem(t('profile.view.labels.serviceAtParish'), 
              user?.serviceAtParish ? t(`profile.options.serviceAtParish.${user.serviceAtParish}`) : '', 'people-outline')}
            {renderDetailItem(t('profile.view.labels.ministryService'), 
              user?.ministryService ? t(`profile.options.ministryService.${user.ministryService}`) : '', 'business-outline')}
            {renderDetailItem(t('profile.view.labels.hasFatherConfessor'), 
              user?.hasFatherConfessor === 'yes' ? 
                `${t('common.yes')} (${user.fatherConfessorName || t('common.notProvided')})` : 
                t('common.no'), 
              'account-tie', 'MaterialCommunity')}
            {renderDetailItem(t('profile.view.labels.hasAssociationMembership'), 
              user?.hasAssociationMembership === 'yes' ? 
                `${t('common.yes')}${user.associationName ? ` (${user.associationName})` : ''}` : 
                t('common.no'), 
              'people-outline')}
          </View>

          {/* Logout and Delete Account Buttons */}
          <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutButtonText}>{t('profile.view.logOut')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteAccount}>
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>{t('profile.view.deleteAccount.button')}</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 15,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFF',
    marginLeft: 5,
    fontSize: 16,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 5,
  },
  detailItem: {
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    marginLeft: 28,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginTop: 30,
    marginBottom: 50,
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginBottom: 50,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  childrenContainer: {
    marginLeft: 28,
  },
  childItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  childName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  childDetail: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  childDetailsContainer: {
    flex: 1,
    marginLeft: 10,
  },
  childItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  childName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  childDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
