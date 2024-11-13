import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { EventList } from '../components/Events/EventList';
import { EventFilters } from '../components/Events/EventFilters';
import { EventService } from '../services/EventService';
import { Event, EventCategory } from '../types';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { format, addHours, startOfDay, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { toEthiopian, getEthiopianMonthName, getEthiopianDayName, ETHIOPIAN_MONTHS } from '../utils/ethiopianCalendar';

const TIME_LABELS = [
  '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
  '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
];

const HOUR_HEIGHT = 60;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_HEADER_HEIGHT = 50;
const TIME_COLUMN_WIDTH = 60;
const DAY_COLUMN_WIDTH = (SCREEN_WIDTH - TIME_COLUMN_WIDTH) / 7; // Divide remaining space equally

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    selected?: boolean;
    selectedColor?: string;
  };
}

// Helper function to convert Date to Ethiopian date
const convertDateToEthiopian = (date: Date) => {
  return toEthiopian(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
};

const WeekView = ({ 
  events, 
  onEventPress, 
  selectedDate,
  onDayPress,
}: { 
  events: Event[], 
  onEventPress: (eventId: number) => void,
  selectedDate: Date,
  onDayPress: (date: Date) => void,
}) => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    try {
      const date = new Date(selectedDate);
      if (isNaN(date.getTime())) {
        // If invalid date, return current date
        return new Date();
      }
      const day = date.getDay();
      date.setDate(date.getDate() - day);
      return date;
    } catch (error) {
      console.error('Error setting initial week:', error);
      return new Date(); // Fallback to current date
    }
  });

  const weekDays = useMemo(() => {
    try {
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + i);
        return date;
      });
    } catch (error) {
      console.error('Error generating week days:', error);
      // Return current week as fallback
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return date;
      });
    }
  }, [currentWeekStart]);

  // Add error boundary
  if (!currentWeekStart || !weekDays) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading calendar view</Text>
      </View>
    );
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => {
      const date = new Date(prev);
      date.setDate(date.getDate() + (direction === 'prev' ? -7 : 7));
      return date;
    });
  };

  // Debug logging
  console.log('Week View Debug:', {
    currentWeekStart: format(currentWeekStart, 'yyyy-MM-dd'),
    weekDays: weekDays.map(d => format(d, 'yyyy-MM-dd')),
    events: events.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date,
      parsedDate: format(new Date(e.date), 'yyyy-MM-dd HH:mm')
    }))
  });

  // Helper function to check if a date falls on a specific day
  const isEventOnDay = (eventDate: string, day: Date) => {
    try {
      const eventDateTime = new Date(eventDate);
      return (
        eventDateTime.getFullYear() === day.getFullYear() &&
        eventDateTime.getMonth() === day.getMonth() &&
        eventDateTime.getDate() === day.getDate()
      );
    } catch (error) {
      console.error('Error comparing dates:', error);
      return false;
    }
  };

  // Filter events for the current week
  const weekEvents = events.filter(event => 
    weekDays.some(day => isEventOnDay(event.date, day))
  );

  console.log('Filtered week events:', weekEvents);

  return (
    <View style={styles.weekContainer}>
      {/* Week Navigation */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity onPress={() => navigateWeek('prev')} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.weekRangeText}>
          {isAmharic ? (
            (() => {
              const startEth = convertDateToEthiopian(weekDays[0]);
              const endEth = convertDateToEthiopian(weekDays[6]);
              return `${getEthiopianMonthName(startEth.month)} ${startEth.day} - ${getEthiopianMonthName(endEth.month)} ${endEth.day}፣ ${endEth.year}`;
            })()
          ) : (
            `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`
          )}
        </Text>
        <TouchableOpacity onPress={() => navigateWeek('next')} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Week header */}
      <View style={styles.weekHeader}>
        <View style={styles.timeHeaderSpacer} />
        {weekDays.map((day, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.dayHeader}
            onPress={() => onDayPress(day)}
          >
            <Text style={styles.dayHeaderText}>
              {isAmharic ? 
                getEthiopianDayName(day.getDay()) :
                format(day, 'EEE')
              }
            </Text>
            <Text style={[
              styles.dayHeaderDate,
              isSameDay(day, new Date()) && styles.todayDate
            ]}>
              {isAmharic ? 
                convertDateToEthiopian(day).day :
                format(day, 'd')
              }
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time grid */}
      <ScrollView style={styles.timeGridContainer}>
        <View style={styles.timeGridWrapper}>
          {/* Time labels */}
          <View style={styles.timeLabelsColumn}>
            {TIME_LABELS.map((label, index) => (
              <View key={index} style={styles.timeLabel}>
                <Text style={styles.timeLabelText}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Days grid */}
          <ScrollView 
            horizontal={false} 
            showsHorizontalScrollIndicator={false}
            style={styles.daysGridContainer}
          >
            <View style={styles.daysGrid}>
              {weekDays.map((day, dayIndex) => (
                <View key={dayIndex} style={styles.dayColumn}>
                  {TIME_LABELS.map((_, hourIndex) => (
                    <View key={hourIndex} style={styles.hourCell} />
                  ))}
                  
                  {/* Events */}
                  {events
                    .filter(event => isEventOnDay(event.date, day))
                    .map(event => {
                      const startTime = new Date(event.date);
                      const endTime = new Date(event.end_date);
                      const hours = startTime.getHours();
                      const minutes = startTime.getMinutes();
                      const topPosition = (hours * HOUR_HEIGHT) + ((minutes / 60) * HOUR_HEIGHT);
                      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

                      return (
                        <TouchableOpacity
                          key={event.id}
                          style={[
                            styles.eventBlock,
                            {
                              top: topPosition,
                              height: Math.max(duration * HOUR_HEIGHT, 30),
                              width: DAY_COLUMN_WIDTH - 4,
                            },
                          ]}
                          onPress={() => onEventPress(event.id)}
                        >
                          <Text style={styles.eventTitle} numberOfLines={1}>
                            {event.title}
                          </Text>
                          <Text style={styles.eventTime}>
                            {format(startTime, 'h:mm a')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const DayView = ({ events, onEventPress, selectedDate }: {
  events: Event[],
  onEventPress: (eventId: number) => void,
  selectedDate: Date
}) => {
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const [currentDate, setCurrentDate] = useState(() => {
    try {
      const date = new Date(selectedDate);
      return isNaN(date.getTime()) ? new Date() : date;
    } catch (error) {
      console.error('Error setting initial date:', error);
      return new Date();
    }
  });

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.getTime());
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

  const dayEvents = events.filter(event => 
    isSameDay(new Date(event.date), currentDate)
  );

  // Create time slots for the day view
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const date = new Date(currentDate);
    date.setHours(i, 0, 0, 0);
    return date;
  });

  return (
    <View style={styles.dayContainer}>
      {/* Day Navigation */}
      <View style={styles.dayNavigation}>
        <TouchableOpacity onPress={() => navigateDay('prev')} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.dayHeaderText}>
          {isAmharic ? (
            (() => {
              const ethDate = convertDateToEthiopian(currentDate);
              return `${getEthiopianDayName(currentDate.getDay())}፣ ${getEthiopianMonthName(ethDate.month)} ${ethDate.day}፣ ${ethDate.year}`;
            })()
          ) : (
            format(currentDate, 'EEEE, MMMM d, yyyy')
          )}
        </Text>
        <TouchableOpacity onPress={() => navigateDay('next')} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Time grid */}
      <ScrollView style={styles.timeGridContainer}>
        <View style={styles.timeGridWrapper}>
          {/* Time labels */}
          <View style={styles.timeLabelsColumn}>
            {timeSlots.map((time, index) => (
              <View key={index} style={styles.timeLabel}>
                <Text style={styles.timeLabelText}>
                  {format(time, 'h:mm a')}
                </Text>
              </View>
            ))}
          </View>

          {/* Events grid */}
          <View style={styles.dayEventsGrid}>
            {/* Hour grid lines */}
            {timeSlots.map((_, index) => (
              <View key={index} style={styles.hourCell} />
            ))}

            {/* Events */}
            {dayEvents.map(event => {
              try {
                const startTime = new Date(event.date);
                const endTime = new Date(event.end_date);
                const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

                return (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      styles.eventBlock,
                      {
                        top: startHour * HOUR_HEIGHT,
                        height: Math.max(duration * HOUR_HEIGHT, 30),
                        width: '90%',
                        left: '5%',
                      },
                    ]}
                    onPress={() => onEventPress(event.id)}
                  >
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.eventTime}>
                      {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                    </Text>
                  </TouchableOpacity>
                );
              } catch (error) {
                console.error('Error rendering event:', error, event);
                return null;
              }
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Add helper function for Ethiopian month view
const getEthiopianMonthDates = (date: Date) => {
  const ethiopianDate = convertDateToEthiopian(date);
  const daysInMonth = 30; // Ethiopian months have 30 days except Pagume
  
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      gregorian: new Date(date), // You'll need to calculate corresponding Gregorian date
      ethiopian: {
        year: ethiopianDate.year,
        month: ethiopianDate.month,
        day
      }
    };
  });

  return days;
};

// Custom day component for Ethiopian calendar
const renderEthiopianDay = (dateData: any) => {
  try {
    // Extract date information from the date object
    const { date } = dateData;
    if (!date) {
      return <Text>{dateData.children}</Text>;
    }

    // Convert to Ethiopian date using the timestamp
    const gregorianDate = new Date(date.timestamp);
    const ethiopianDate = toEthiopian(
      gregorianDate.getFullYear(),
      gregorianDate.getMonth() + 1,
      gregorianDate.getDate()
    );

    // Create the day component
    return (
      <TouchableOpacity
        style={[
          styles.ethiopianDayContainer,
          dateData.marking?.selected && styles.selectedContainer,
          dateData.state === 'disabled' && styles.disabledContainer,
        ]}
        onPress={() => {
          const formattedDate = format(gregorianDate, 'yyyy-MM-dd');
          dateData.onPress({ 
            dateString: formattedDate,
            day: gregorianDate.getDate(),
            month: gregorianDate.getMonth() + 1,
            year: gregorianDate.getFullYear(),
            timestamp: date.timestamp
          });
        }}
        disabled={dateData.state === 'disabled'}
      >
        <Text style={[
          styles.ethiopianDayText,
          dateData.state === 'today' && { color: '#2196F3' }, // Match English calendar today color
          dateData.state === 'disabled' && styles.disabledText,
          dateData.marking?.selected && styles.selectedText,
        ]}>
          {ethiopianDate.day}
        </Text>
        {dateData.marking?.marked && (
          <View style={styles.dotContainer}>
            <View style={styles.dot} />
          </View>
        )}
      </TouchableOpacity>
    );
  } catch (error) {
    console.error('Error rendering Ethiopian day:', error);
    return <Text>{dateData.children}</Text>;
  }
};

// Update the formatMonthHeader function to use the same conversion as week and day views
const formatMonthHeader = (date: any) => {
  try {
    // Convert the date to a proper Date object
    const gregorianDate = new Date(date);
    
    // Use the same conversion method as week/day views
    const ethiopianDate = toEthiopian(
      gregorianDate.getFullYear(),
      gregorianDate.getMonth() + 1,
      gregorianDate.getDate()
    );
    
    // Return formatted Ethiopian month and year
    return `${getEthiopianMonthName(ethiopianDate.month)} ${ethiopianDate.year}`;
  } catch (error) {
    console.error('Error formatting month header:', error, {
      input: date,
      type: typeof date
    });
    return format(new Date(date), 'MMMM yyyy'); // Fallback to Gregorian
  }
};

export default function EventsScreen() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Add state for calendar display type
  const { i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const [eventsData, categoriesData] = await Promise.all([
        EventService.getEvents({
          category: selectedCategory || undefined,
        }),
        EventService.getCategories(),
      ]);

      setEvents(eventsData);
      setCategories(categoriesData);
      
      // Filter events based on selected date if any
      filterEventsByDate(eventsData, selectedDate);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedDate]);

  const filterEventsByDate = (eventsList: Event[], date: string | null) => {
    if (!date) {
      setFilteredEvents(eventsList);
      return;
    }

    // Filter events for the selected date
    const filtered = eventsList.filter(event => {
      if (!event.date) return false;
      const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
      return eventDate === date;
    });

    setFilteredEvents(filtered);
  };

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleDateSelect = (date: DateData) => {
    setSelectedDate(date.dateString);
    filterEventsByDate(events, date.dateString);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleEventPress = (eventId: number) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const handleViewModeChange = (mode: 'month' | 'week' | 'day') => {
    setViewMode(mode);
    // Reset filters when changing view mode
    setSelectedDate(null);
    filterEventsByDate(events, null);
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setViewMode('day');
  };

  // Modify the getMarkedDates function to handle both calendar types
  const getMarkedDates = (): MarkedDates => {
    const markedDates: MarkedDates = {};

    events.forEach(event => {
      if (event.date) {
        try {
          const dateStr = format(new Date(event.date), 'yyyy-MM-dd');
          markedDates[dateStr] = {
            marked: true,
            selected: dateStr === selectedDate,
            selectedColor: '#2196F3',
          };
        } catch (error) {
          console.warn('Invalid date format:', event.date);
        }
      }
    });

    // If a date is selected but not marked, add it
    if (selectedDate && !markedDates[selectedDate]) {
      markedDates[selectedDate] = {
        selected: true,
        selectedColor: '#2196F3',
      };
    }

    return markedDates;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EventFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
      
      {viewMode === 'month' && (
        <>
          <Calendar
            current={selectedDate || undefined}
            onDayPress={handleDateSelect}
            markedDates={getMarkedDates()}
            theme={{
              selectedDayBackgroundColor: '#2196F3',
              todayTextColor: '#2196F3',
              dotColor: '#2196F3',
              textDayFontFamily: isAmharic ? 'YourEthiopianFont' : undefined,
              monthTextColor: '#000',
              textMonthFontSize: 16,
              textMonthFontWeight: 'bold',
            }}
            dayComponent={isAmharic ? renderEthiopianDay : undefined}
            monthFormat={isAmharic ? 'yyyy MMMM' : 'MMMM yyyy'}
            renderHeader={(date) => (
              <View style={styles.monthHeaderContainer}>
                <Text style={styles.monthHeaderText}>
                  {isAmharic ? formatMonthHeader(date) : format(new Date(date), 'MMMM yyyy')}
                </Text>
              </View>
            )}
          />
          <EventList
            events={selectedDate ? filteredEvents : events}
            onEventPress={handleEventPress}
            onRefresh={loadEvents}
            loading={loading}
          />
        </>
      )}
      {viewMode === 'week' ? (
        <WeekView 
          events={events}
          onEventPress={handleEventPress}
          selectedDate={selectedDate ? new Date(selectedDate) : new Date()}
          onDayPress={handleDayPress}
        />
      ) : (
        <DayView
          events={events}
          onEventPress={handleEventPress}
          selectedDate={selectedDate ? new Date(selectedDate) : new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendar: {
    marginBottom: 10,
  },
  weekViewCalendar: {
    height: 100, // Reduced height for week view
  },
  dayViewCalendar: {
    height: 70, // Minimal height for day view
  },
  timeGridContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  timeLabels: {
    width: 60,
    borderRightWidth: 1,
    borderColor: '#eee',
  },
  timeLabel: {
    height: HOUR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  timeLabelText: {
    fontSize: 12,
    color: '#666',
  },
  eventsGrid: {
    flex: 1,
    position: 'relative',
  },
  eventBlock: {
    position: 'absolute',
    left: 5,
    backgroundColor: '#2196F3',
    borderRadius: 4,
    padding: 4,
    opacity: 0.9,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventTime: {
    color: '#fff',
    fontSize: 10,
  },
  timeViewContainer: {
    flex: 1,
  },
  weekContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  timeHeaderSpacer: {
    width: TIME_COLUMN_WIDTH,
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayHeader: {
    width: DAY_COLUMN_WIDTH,
    alignItems: 'center',
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  dayHeaderText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dayHeaderDate: {
    fontSize: 16,
    fontWeight: '500',
  },
  todayDate: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  timeGridWrapper: {
    flexDirection: 'row',
    height: HOUR_HEIGHT * 24, // Full 24 hours
  },
  timeLabelsColumn: {
    width: TIME_COLUMN_WIDTH,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  timeLabel: {
    height: HOUR_HEIGHT,
    justifyContent: 'center',
    paddingLeft: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timeLabelText: {
    fontSize: 12,
    color: '#666',
  },
  daysGridContainer: {
    flex: 1,
  },
  daysGrid: {
    flexDirection: 'row',
    height: '100%',
  },
  dayColumn: {
    width: DAY_COLUMN_WIDTH,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    height: '100%',
  },
  hourCell: {
    height: HOUR_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  eventBlock: {
    position: 'absolute',
    backgroundColor: '#2196F3',
    borderRadius: 4,
    padding: 4,
    margin: 2,
    opacity: 0.9,
    zIndex: 1,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventTime: {
    color: '#fff',
    fontSize: 10,
  },
  dayContainer: {
    flex: 1,
  },
  dayViewHeader: {
    height: DAY_HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayViewHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayEventsContainer: {
    flex: 1,
    position: 'relative',
  },
  timeGridContainer: {
    flex: 1,
  },
  timeLabels: {
    position: 'absolute',
    left: 0,
    width: 60,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  timeLabel: {
    height: HOUR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  timeLabelText: {
    fontSize: 12,
    color: '#666',
  },
  eventsGrid: {
    flexDirection: 'row',
    paddingLeft: 60,
  },
  eventBlock: {
    position: 'absolute',
    backgroundColor: '#2196F3',
    borderRadius: 4,
    padding: 4,
    opacity: 0.9,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventTime: {
    color: '#fff',
    fontSize: 10,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  navButton: {
    padding: 8,
  },
  weekRangeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  dayEventsGrid: {
    flex: 1,
    position: 'relative',
    marginLeft: 60, // Width of time labels
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  ethiopianDayContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  ethiopianDayText: {
    fontSize: 16,
    color: '#000',
  },
  selectedContainer: {
    backgroundColor: '#2196F3',
  },
  selectedText: {
    color: '#fff',
  },
  disabledContainer: {
    opacity: 0.4,
  },
  disabledText: {
    color: '#666',
  },
  dotContainer: {
    alignItems: 'center',
    marginTop: 1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2196F3',
  },
  monthHeaderContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
