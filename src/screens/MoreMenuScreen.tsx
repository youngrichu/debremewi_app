import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MoreStackParamList } from '../types';
import { useTranslation } from 'react-i18next';
import { getFontSize, IS_TABLET } from '../utils/responsive';

type MoreScreenNavigationProp = StackNavigationProp<MoreStackParamList>;

const MoreMenuScreen = () => {
  const navigation = useNavigation<MoreScreenNavigationProp>();
  const { t } = useTranslation();

  const menuItems = [
    {
      title: t('more.menu.aboutUs'),
      icon: 'information-circle-outline' as const,
      screen: 'About Us' as const,
    },
    {
      title: t('more.menu.services'),
      icon: 'list-outline' as const,
      screen: 'Services' as const,
    },
    {
      title: t('more.menu.location'),
      icon: 'location-outline' as const,
      screen: 'Location' as const,
    },
    {
      title: t('more.menu.contactUs'),
      icon: 'mail-outline' as const,
      screen: 'Contact Us' as const,
    },
  ];

  return (
    <View style={styles.container}>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => navigation.navigate(item.screen)}
        >
          <View style={styles.menuItemContent}>
            <Ionicons name={item.icon} size={IS_TABLET ? 28 : 24} color="#2196F3" />
            <Text style={styles.menuItemText}>{item.title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={IS_TABLET ? 28 : 24} color="#666" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: IS_TABLET ? 24 : 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: IS_TABLET ? 20 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: getFontSize(16),
    marginLeft: IS_TABLET ? 20 : 16,
    color: '#333',
  },
});

export default MoreMenuScreen; 