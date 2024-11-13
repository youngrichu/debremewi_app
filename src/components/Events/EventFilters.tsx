import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { EventCategory } from '../../types';
import { Ionicons } from '@expo/vector-icons';

interface EventFiltersProps {
  categories: EventCategory[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  viewMode: 'month' | 'week' | 'day';
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
  labels: {
    month: string;
    week: string;
    day: string;
    all: string;
    gubae: string;
    sermon: string;
  };
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  viewMode,
  onViewModeChange,
  labels
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'month' && styles.activeViewMode]}
          onPress={() => onViewModeChange('month')}
        >
          <Ionicons name="calendar" size={20} color={viewMode === 'month' ? '#2196F3' : '#666'} />
          <Text style={styles.viewModeText}>{labels.month}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'week' && styles.activeViewMode]}
          onPress={() => onViewModeChange('week')}
        >
          <Ionicons name="calendar-outline" size={20} color={viewMode === 'week' ? '#2196F3' : '#666'} />
          <Text style={[styles.viewModeText, viewMode === 'week' && styles.activeViewModeText]}>
            {labels.week}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'day' && styles.activeViewMode]}
          onPress={() => onViewModeChange('day')}
        >
          <Ionicons name="today" size={20} color={viewMode === 'day' ? '#2196F3' : '#666'} />
          <Text style={[styles.viewModeText, viewMode === 'day' && styles.activeViewModeText]}>
            {labels.day}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[styles.categoryButton, !selectedCategory && styles.activeCategory]}
          onPress={() => onCategorySelect(null)}
        >
          <Text style={[styles.categoryText, !selectedCategory && styles.activeCategoryText]}>
            {labels.all}
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id.toString() && styles.activeCategory,
            ]}
            onPress={() => onCategorySelect(category.id.toString())}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id.toString() && styles.activeCategoryText,
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
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    gap: 4,
  },
  activeViewMode: {
    backgroundColor: '#E3F2FD',
  },
  viewModeText: {
    color: '#666',
    fontSize: 14,
  },
  activeViewModeText: {
    color: '#2196F3',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  activeCategory: {
    backgroundColor: '#2196F3',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  activeCategoryText: {
    color: '#fff',
  },
}); 