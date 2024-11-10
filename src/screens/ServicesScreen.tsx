import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const ServicesScreen = () => {
  const services = [
    'Liturgy',
    'Communion',
    'Sermon',
    'Christianing',
    'MATRIMONY',
    'Prayers',
    'FITIHAT (Prayer for the dead)',
    'Congregation',
  ];

  const routineServices = [
    {
      day: 'EVERY SUNDAY',
      time: '5:00AM - 11:00AM',
      description: 'Litany, Liturgy, Sermon and Other Services',
    },
    {
      day: 'EVERY FRIDAY',
      time: '6:00PM - 7:30PM',
      description: 'Evening prayer and Sermon',
    },
    {
      day: 'EVERY SATURDAY',
      time: '6:00AM - 7:30AM',
      description: 'Morning prayers, Litany and Other Services',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Our Services</Text>
        <View style={styles.servicesList}>
          {services.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Routine Services</Text>
        {routineServices.map((service, index) => (
          <View key={index} style={styles.routineService}>
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