import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { IS_TABLET, getFontSize, scale } from '../utils/responsive';

const CommunityScreen = () => {
  const { t } = useTranslation();

  const churches = [
    {
      id: 'dubai',
      mapLink: "https://maps.app.goo.gl/4KivcCDzxMf4MAWi7",
      isMain: true
    },
    {
      id: 'jebelAli',
      mapLink: "https://maps.app.goo.gl/usVixg9saDYHwdh46"
    }
  ];

  const handleMapPress = async (mapLink: string) => {
    try {
      await Linking.openURL(mapLink);
    } catch (error) {
      console.error('Error opening map:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('location.title')}</Text>

      {churches.map((church) => (
        <View
          key={church.id}
          style={[
            styles.churchCard,
            church.isMain && styles.mainChurchCard
          ]}
        >
          {church.isMain && (
            <View style={styles.mainChurchBadge}>
              <Text style={styles.mainChurchBadgeText}>{t('location.mainChurchBadge')}</Text>
            </View>
          )}

          <Text style={styles.churchName}>
            {t(`location.churches.${church.id}.name`)}
          </Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={IS_TABLET ? scale(20) : 16} color="#666" />
            <Text style={styles.locationText}>
              {t(`location.churches.${church.id}.city`)}
            </Text>
          </View>
          <View style={styles.coordinatesContainer}>
            <Ionicons name="navigate" size={IS_TABLET ? scale(20) : 16} color="#666" />
            <Text style={styles.coordinatesText}>
              {t(`location.churches.${church.id}.venue`) || t('location.notSpecified.venue')}
            </Text>
          </View>
          {t(`location.churches.${church.id}.location`) && (
            <View style={styles.locationDetailContainer}>
              <Ionicons name="pin" size={IS_TABLET ? scale(20) : 16} color="#666" />
              <Text style={styles.locationDetailText}>
                {t(`location.churches.${church.id}.location`) || t('location.notSpecified.location')}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => handleMapPress(church.mapLink)}
          >
            <Ionicons name="map" size={IS_TABLET ? scale(26) : 20} color="#fff" />
            <Text style={styles.mapButtonText}>{t('location.openInMaps')}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: getFontSize(24),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  churchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainChurchCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  mainChurchBadge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mainChurchBadgeText: {
    color: '#fff',
    fontSize: getFontSize(12),
    fontWeight: 'bold',
  },
  churchName: {
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: getFontSize(16),
    color: '#666',
    marginLeft: 8,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  coordinatesText: {
    fontSize: getFontSize(14),
    color: '#666',
    marginLeft: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: getFontSize(16),
    fontWeight: '500',
    marginLeft: 8,
  },
  locationDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationDetailText: {
    fontSize: getFontSize(14),
    color: '#666',
    marginLeft: 8,
  },
});

export default CommunityScreen;