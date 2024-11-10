import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const AboutUsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>About Us</Text>
        <Text style={styles.paragraph}>
          Dubai Debiremewi St. Michael and St. Hripsime Church serves as a significant religious and cultural center for the Ethiopian and Eritrean communities in Dubai.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>History</Text>
        <Text style={styles.paragraph}>
          The Dubai Debiremewi St. Michael and St. Hripsime Church was established to cater to the spiritual needs of Ethiopian and Eritrean Orthodox Christians residing in Dubai. This church is named after two important figures in Ethiopian Christianity: St. Michael, who is revered as a protector and leader of angels, and St. Hripsime, a martyr who symbolizes faith and courage.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Governance</Text>
        <Text style={styles.paragraph}>
          The governance of the church is structured under the Ethiopian Orthodox Tewahedo Church's hierarchy. A priest leads the congregation, supported by a council made up of community members who assist in administrative duties and organizing events.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Faith</Text>
        <Text style={styles.paragraph}>
          The faith practiced at Dubai Debiremewi St. Michael and St. Hripsime Church is deeply rooted in the Ethiopian Orthodox tradition. Worship includes regular liturgical services, prayers, and sacraments such as baptism and marriage.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mission</Text>
        <Text style={styles.paragraph}>
          The mission of the church extends beyond spiritual guidance; it aims to foster a sense of community among its members while promoting cultural heritage. The church engages in various outreach programs that support local charities and assist those in need within the community.
        </Text>
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
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
});

export default AboutUsScreen; 