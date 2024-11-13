import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ProfileScreenNavigationProp } from '../types';
import { clearUser } from '../store/userSlice';
import { setAuthState } from '../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteAccount } from '../services/AuthService';
import { useTranslation } from 'react-i18next';

const formatDisplayValue = (value: string | null | undefined, options?: { [key: string]: string }) => {
  if (!value) return 'Not provided';
  
  if (options && options[value]) {
    return options[value];
  }

  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const handleEditPress = () => {
    navigation.navigate('HomeStack', {
      screen: 'EditProfile'
    });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      dispatch(clearUser());
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
      dispatch(clearUser());
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

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        {(user.profilePhotoUrl || user.profilePhoto || user.photo) ? (
          <Image 
            source={{ 
              uri: user.profilePhotoUrl || user.profilePhoto || user.photo 
            }} 
            style={styles.profilePhoto} 
          />
        ) : (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.firstName ? user.firstName[0].toUpperCase() : '?'}
            </Text>
          </View>
        )}
        <Text style={styles.fullName}>
          {user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : t('profile.messages.completeProfile')}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
          <Ionicons name="pencil" size={20} color="#FFF" />
          <Text style={styles.editButtonText}>{t('profile.view.editProfile')}</Text>
        </TouchableOpacity>
      </View>

      {/* Personal Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.view.personalInfo')}</Text>
        {renderDetailItem(t('profile.view.labels.name'), 
          `${user.firstName} ${user.lastName}`, 'person-outline')}
        {renderDetailItem(t('profile.view.labels.christianName'), 
          user.christianName, 'book-outline')}
        {renderDetailItem(t('profile.view.labels.gender'), 
          user.gender ? t(`profile.options.gender.${user.gender}`) : '', 'male-female-outline')}
        {renderDetailItem(t('profile.view.labels.maritalStatus'), 
          user.maritalStatus ? t(`profile.options.maritalStatus.${user.maritalStatus}`) : '', 'heart-outline')}
        {renderDetailItem(t('profile.view.labels.educationLevel'), 
          user.educationLevel ? t(`profile.options.educationLevel.${user.educationLevel}`) : '', 'school-outline')}
        {renderDetailItem(t('profile.view.labels.occupation'), 
          user.occupation, 'briefcase-outline')}
      </View>

      {/* Contact Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.view.contactInfo')}</Text>
        {renderDetailItem(t('profile.view.labels.phoneNumber'), 
          user.phoneNumber, 'call-outline')}
        {renderDetailItem(t('profile.view.labels.residencyCity'), 
          user.residencyCity ? t(`profile.options.cities.${user.residencyCity}`) : '', 'location-outline')}
        {renderDetailItem(t('profile.view.labels.residenceAddress'), 
          user.residenceAddress, 'home-outline')}
        {renderDetailItem(t('profile.view.labels.emergencyContact'), 
          user.emergencyContact, 'alert-circle-outline')}
      </View>

      {/* Church Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.view.churchInfo')}</Text>
        {renderDetailItem(t('profile.view.labels.christianLife'), 
          user.christianLife ? t(`profile.options.christianLife.${user.christianLife}`) : '', 'heart-circle-outline')}
        {renderDetailItem(t('profile.view.labels.serviceAtParish'), 
          user.serviceAtParish ? t(`profile.options.serviceAtParish.${user.serviceAtParish}`) : '', 'people-outline')}
        {renderDetailItem(t('profile.view.labels.ministryService'), 
          user.ministryService ? t(`profile.options.ministryService.${user.ministryService}`) : '', 'business-outline')}
      </View>

      {/* Additional Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.view.additionalInfo')}</Text>
        {renderDetailItem(t('profile.view.labels.hasFatherConfessor'), 
          user.hasFatherConfessor === 'yes' ? 
            `${t('common.yes')} (${user.fatherConfessorName || t('common.notProvided')})` : 
            t('common.no'), 
          'account-tie', 'MaterialCommunity')}
        {renderDetailItem(t('profile.view.labels.hasAssociationMembership'), 
          user.hasAssociationMembership === 'yes' ? t('common.yes') : t('common.no'), 
          'people-outline')}
        {renderDetailItem(t('profile.view.labels.residencePermit'), 
          user.residencePermit === 'yes' ? t('common.yes') : t('common.no'), 
          'card-outline')}
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
});
