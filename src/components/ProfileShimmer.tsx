import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

const ShimmerComponent = ShimmerPlaceholder as any;

export const ProfileShimmer = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <ShimmerComponent
            LinearGradient={LinearGradient}
            style={styles.name}
          />
          <ShimmerComponent
            LinearGradient={LinearGradient}
            style={styles.email}
          />
        </View>
      </View>

      {/* Profile Details */}
      <View style={styles.detailsContainer}>
        {[1, 2, 3, 4, 5].map((_, index) => (
          <View key={index} style={styles.detailItem}>
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={styles.detailIcon}
            />
            <View style={styles.detailContent}>
              <ShimmerComponent
                LinearGradient={LinearGradient}
                style={styles.detailLabel}
              />
              <ShimmerComponent
                LinearGradient={LinearGradient}
                style={styles.detailValue}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Children Section */}
      <View style={styles.childrenSection}>
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.sectionTitle}
        />
        {[1, 2].map((_, index) => (
          <View key={index} style={styles.childItem}>
            <ShimmerComponent
              LinearGradient={LinearGradient}
              style={styles.childName}
            />
            <View style={styles.childDetails}>
              <ShimmerComponent
                LinearGradient={LinearGradient}
                style={styles.childDetail}
              />
              <ShimmerComponent
                LinearGradient={LinearGradient}
                style={styles.childDetail}
              />
              <ShimmerComponent
                LinearGradient={LinearGradient}
                style={styles.childDetail}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.actionButton}
        />
        <ShimmerComponent
          LinearGradient={LinearGradient}
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    width: '80%',
    height: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  email: {
    width: '60%',
    height: 16,
    borderRadius: 4,
  },
  detailsContainer: {
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  detailIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    width: '40%',
    height: 16,
    borderRadius: 4,
    marginBottom: 4,
  },
  detailValue: {
    width: '70%',
    height: 16,
    borderRadius: 4,
  },
  childrenSection: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    marginTop: 8,
  },
  sectionTitle: {
    width: '50%',
    height: 24,
    borderRadius: 4,
    marginBottom: 16,
  },
  childItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  childName: {
    width: '60%',
    height: 20,
    borderRadius: 4,
    marginBottom: 12,
  },
  childDetails: {
    gap: 8,
  },
  childDetail: {
    width: '50%',
    height: 16,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
  },
}); 