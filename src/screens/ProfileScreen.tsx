import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useNavigation, NavigationProp, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootStackParamList, 'Profile'>,
  StackNavigationProp<RootStackParamList>
>;

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const handleEditPress = () => {
    navigation.navigate('HomeStack', {
      screen: 'EditProfile'
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user.firstName ? user.firstName[0].toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.fullName}>
          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Complete Your Profile'}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Profile Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>First Name:</Text>
          <Text style={styles.detailValue}>{user.firstName || 'Not provided'}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Last Name:</Text>
          <Text style={styles.detailValue}>{user.lastName || 'Not provided'}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Phone Number:</Text>
          <Text style={styles.detailValue}>{user.phoneNumber || 'Not provided'}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Gender:</Text>
          <Text style={styles.detailValue}>{user.gender || 'Not specified'}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Christian Name:</Text>
          <Text style={styles.detailValue}>{user.christianName || 'Not provided'}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>City:</Text>
          <Text style={styles.detailValue}>{user.residencyCity || 'Not provided'}</Text>
        </View>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity 
        style={styles.editButton}
        onPress={handleEditPress}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  fullName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  detailsContainer: {
    padding: 24,
    backgroundColor: '#fff',
  },
  detailItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  editButton: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 32,
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});
