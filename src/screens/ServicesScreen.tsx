import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const ServicesScreen = () => {
  const { t } = useTranslation();

  const services = [
    'liturgy',
    'communion',
    'sermon',
    'christianing',
    'matrimony',
    'prayers',
    'fitihat',
    'congregation',
  ];

  const routineServices = [
    {
      key: 'sunday',
      day: t('services.schedule.sunday.day'),
      time: t('services.schedule.sunday.time'),
      description: t('services.schedule.sunday.description'),
    },
    {
      key: 'wednesday',
      day: t('services.schedule.wednesday.day'),
      time: t('services.schedule.wednesday.time'),
      description: t('services.schedule.wednesday.description'),
    },
    {
      key: 'saturday',
      day: t('services.schedule.saturday.day'),
      time: t('services.schedule.saturday.time'),
      description: t('services.schedule.saturday.description'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>{t('services.title')}</Text>
        <View style={styles.servicesList}>
          {services.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <Text style={styles.serviceText}>
                {t(`services.services.${service}`)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('services.routineServices')}</Text>
        {routineServices.map((service) => (
          <View key={service.key} style={styles.routineService}>
            <Text style={styles.dayText}>{service.day}</Text>
            <Text style={styles.timeText}>{service.time}</Text>
            <Text style={styles.descriptionText}>{service.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  serviceText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  routineService: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  dayText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ServicesScreen; 