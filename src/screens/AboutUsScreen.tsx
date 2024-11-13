import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const AboutUsScreen = () => {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>{t('aboutUs.title')}</Text>
        <Text style={styles.paragraph}>
          {t('aboutUs.intro')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('aboutUs.sections.history.title')}</Text>
        <Text style={styles.paragraph}>
          {t('aboutUs.sections.history.content')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('aboutUs.sections.governance.title')}</Text>
        <Text style={styles.paragraph}>
          {t('aboutUs.sections.governance.content')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('aboutUs.sections.faith.title')}</Text>
        <Text style={styles.paragraph}>
          {t('aboutUs.sections.faith.content')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('aboutUs.sections.mission.title')}</Text>
        <Text style={styles.paragraph}>
          {t('aboutUs.sections.mission.content')}
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