import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { EventCategory } from '../../types';

interface EventFiltersProps {
  categories: EventCategory[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  viewMode: 'month' | 'week' | 'day';
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  viewMode,
  onViewModeChange,
}) => {
  const viewModes = [
    { label: 'Month', value: 'month' },
    { label: 'Week', value: 'week' },
    { label: 'Day', value: 'day' },
  ] as const;

  return (
    <View style={styles.container}>
      <View style={styles.viewModeContainer}>
        {viewModes.map((mode) => (
          <TouchableOpacity
            key={mode.value}
            style={[
              styles.viewModeButton,
              viewMode === mode.value && styles.viewModeButtonActive,
            ]}
            onPress={() => onViewModeChange(mode.value)}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === mode.value && styles.viewModeTextActive,
              ]}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            !selectedCategory && styles.categoryChipActive,
          ]}
          onPress={() => onCategorySelect(null)}
        >
          <Text
            style={[
              styles.categoryText,
              !selectedCategory && styles.categoryTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.slug && styles.categoryChipActive,
            ]}
            onPress={() => onCategorySelect(category.slug)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.slug && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  viewModeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  viewModeButtonActive: {
    backgroundColor: '#2196F3',
  },
  viewModeText: {
    color: '#666',
  },
  viewModeTextActive: {
    color: '#fff',
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#2196F3',
  },
  categoryText: {
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
}); 