import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as Calendar from 'expo-calendar';
import { Event } from '../types';
import { useTranslation } from 'react-i18next';

interface EventDetailProps {
  route: {
    params: {
      event: Event;
    };
  };
}

const EventDetail = ({ route }: EventDetailProps) => {
  const { t } = useTranslation();
  const { event } = route.params;

  const addToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];

        if (defaultCalendar) {
          const startDate = new Date(event.date);
          const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

          await Calendar.createEventAsync(defaultCalendar.id, {
            title: event.title,
            location: event.location,
            startDate,
            endDate,
            notes: event.description
          });

          Alert.alert('Success', t('events.detail.success.addToCalendar'));
        }
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert('Error', t('events.detail.errors.addToCalendar'));
    }
  };

  const getDirections = async () => {
    try {
      const scheme = Platform.select({
        ios: 'maps:0,0?q=',
        android: 'geo:0,0?q='
      });
      const latLng = `${event.latitude},${event.longitude}`;
      const label = event.location;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
      });

      if (url) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert('Error', t('events.detail.errors.getDirections'));
    }
  };

  const shareEvent = async () => {
    try {
      await Share.share({
        message: t('events.detail.shareMessage', {
          title: event.title,
          date: format(new Date(event.date), 'PPP'),
          location: event.location
        })
      });
    } catch (error) {
      console.error('Error sharing event:', error);
      Alert.alert('Error', t('events.detail.errors.share'));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={24} color="#666" />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>{t('events.detail.date')}</Text>
            <Text style={styles.detailValue}>
              {format(new Date(event.date), 'PPP')}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={24} color="#666" />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>{t('events.detail.time')}</Text>
            <Text style={styles.detailValue}>
              {format(new Date(event.date), 'p')}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={24} color="#666" />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>{t('events.detail.location')}</Text>
            <Text style={styles.detailValue}>{event.location}</Text>
          </View>
        </View>

        {event.organizer && (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={24} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>{t('events.detail.organizer')}</Text>
              <Text style={styles.detailValue}>{event.organizer}</Text>
            </View>
          </View>
        )}

        {event.category && (
          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={24} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>{t('events.detail.category')}</Text>
              <Text style={styles.detailValue}>{event.category}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionLabel}>{t('events.detail.description')}</Text>
        <Text style={styles.descriptionText}>{event.description}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={addToCalendar}>
          <Ionicons name="calendar" size={24} color="#2196F3" />
          <Text style={styles.actionButtonText}>{t('events.detail.addToCalendar')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={getDirections}>
          <Ionicons name="navigate" size={24} color="#2196F3" />
          <Text style={styles.actionButtonText}>{t('events.detail.getDirections')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={shareEvent}>
          <Ionicons name="share-social" size={24} color="#2196F3" />
          <Text style={styles.actionButtonText}>{t('events.detail.share')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ... styles remain exactly the same ...
});

export default EventDetail; 