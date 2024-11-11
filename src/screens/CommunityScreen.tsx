import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CommunityScreen = () => {
  const churches = [
    {
      name: "Dubai Debre Mewi St. Michael and St. Hripsime Church",
      location: "8 19dStreet - Umm Hurair 2 - Dubai",
      coordinates: "25.2385° N, 55.3189° E",
      mapLink: "https://maps.app.goo.gl/4KivcCDzxMf4MAWi7",
      isMain: true
    },
    {
      name: "St. Mary Ethiopian Orthodox Church",
      location: "Abu Dhabi",
      coordinates: "24.4539° N, 54.3773° E",
      mapLink: "https://maps.google.com/?q=24.4539,54.3773"
    },
    {
      name: "St. Gabriel Ethiopian Orthodox Church",
      location: "Sharjah",
      coordinates: "25.3463° N, 55.4209° E",
      mapLink: "https://maps.google.com/?q=25.3463,55.4209"
    },
    {
      name: "St. Michael Ethiopian Orthodox Church",
      location: "Al Ain",
      coordinates: "24.1302° N, 55.8023° E",
      mapLink: "https://maps.google.com/?q=24.1302,55.8023"
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
      <Text style={styles.title}>Ethiopian Orthodox Churches in UAE</Text>

      {churches.map((church, index) => (
        <View 
          key={index} 
          style={[
            styles.churchCard,
            church.isMain && styles.mainChurchCard
          ]}
        >
          {church.isMain && (
            <View style={styles.mainChurchBadge}>
              <Text style={styles.mainChurchBadgeText}>Our Church</Text>
            </View>
          )}
          
          <Text style={styles.churchName}>{church.name}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.locationText}>{church.location}</Text>
          </View>
          <View style={styles.coordinatesContainer}>
            <Ionicons name="navigate" size={16} color="#666" />
            <Text style={styles.coordinatesText}>{church.coordinates}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => handleMapPress(church.mapLink)}
          >
            <Ionicons name="map" size={20} color="#fff" />
            <Text style={styles.mapButtonText}>Open in Maps</Text>
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
    fontSize: 24,
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  churchName: {
    fontSize: 18,
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
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  coordinatesText: {
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default CommunityScreen; 