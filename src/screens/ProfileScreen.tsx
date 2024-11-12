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
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      dispatch(clearUser());
      dispatch(setAuthState({ isAuthenticated: false, token: null }));
      Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: handleDeleteAccount, style: 'destructive' }
      ]
    );
  };

  const renderDetailItem = (
    label: string, 
    value: string | null | undefined, 
    icon: string,
    iconFamily: 'Ionicons' | 'MaterialCommunity' = 'Ionicons',
    options?: { [key: string]: string }
  ) => (
    <View style={styles.detailItem}>
      <View style={styles.labelContainer}>
        {iconFamily === 'Ionicons' ? (
          <Ionicons name={icon as any} size={20} color="#666" style={styles.icon} />
        ) : (
          <MaterialCommunityIcons name={icon as any} size={20} color="#666" style={styles.icon} />
        )}
        <Text style={styles.detailLabel}>{label}:</Text>
      </View>
      <Text style={styles.detailValue}>
        {formatDisplayValue(value, options)}
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
          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Complete Your Profile'}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
          <Ionicons name="pencil" size={20} color="#FFF" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        {renderDetailItem('First Name', user.firstName, 'person-outline')}
        {renderDetailItem('Last Name', user.lastName, 'person-outline')}
        {renderDetailItem('Christian Name', user.christianName, 'cross', 'MaterialCommunity')}
        {renderDetailItem('Gender', user.gender, 'male-female-outline')}
        {renderDetailItem('Marital Status', user.maritalStatus, 'heart-outline')}
        {renderDetailItem('Children', user.hasChildren === 'yes' ? 
          `Yes (${user.numberOfChildren || 'number not specified'})` : 
          'No', 'people-outline')}
        {renderDetailItem('Education Level', user.educationLevel, 'school-outline', 'Ionicons', {
          'grade_10': 'Completed Grade 10',
          'grade_12': 'Completed Grade 12',
        })}
        {renderDetailItem('Occupation', user.occupation, 'briefcase-outline')}

        <Text style={styles.sectionTitle}>Contact Information</Text>
        {renderDetailItem('Phone Number', user.phoneNumber, 'call-outline')}
        {renderDetailItem('City of Residence', user.residencyCity, 'location-outline', 'Ionicons', {
          'abu_dhabi': 'Abu Dhabi',
          'ras_al_khaimah': 'Ras Al Khaimah',
          'umm_al_quwain': 'Umm Al Quwain',
          'al_ain': 'Al Ain',
        })}
        {renderDetailItem('Residence Address', user.residenceAddress, 'home-outline')}
        {renderDetailItem('Emergency Contact', user.emergencyContact, 'alert-circle-outline')}
        {renderDetailItem('Residence Permit', user.residencePermit === 'yes' ? 'Yes' : 'No', 'document-text-outline')}

        <Text style={styles.sectionTitle}>Church Information</Text>
        {renderDetailItem('Christian Life Status', user.christianLife, 'church', 'MaterialCommunity', {
          'not_repent': 'Not Repented',
          'repent': 'Repented',
          'communion': 'Takes Holy Communion',
        })}
        {renderDetailItem('Service at Parish', user.serviceAtParish, 'church', 'MaterialCommunity', {
          'sub_department': 'Sub-department Service',
          'sunday_school': 'Sunday School Service',
        })}
        {renderDetailItem('Sub-department', user.ministryService, 'account-group', 'MaterialCommunity', {
          'media_it': 'Media and IT',
          'public_relation': 'Public Relations',
        })}
        {renderDetailItem('Father Confessor', user.hasFatherConfessor === 'yes' ? 
          `Yes (${user.fatherConfessorName || 'name not specified'})` : 
          'No', 'account-tie', 'MaterialCommunity')}
        {renderDetailItem('Association Membership', user.hasAssociationMembership === 'yes' ? 
          `Yes (${user.associationName || 'name not specified'})` : 
          'No', 'account-group-outline', 'MaterialCommunity')}
      </View>

      {/* Logout and Delete Account Buttons */}
      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteAccount}>
        <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        <Text style={styles.deleteButtonText}>Delete Account</Text>
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
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
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
  detailsContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    margin: 10,
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
    marginTop: 20,
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
