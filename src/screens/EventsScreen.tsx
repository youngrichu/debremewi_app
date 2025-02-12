import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Text, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
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
import { EventsShimmer } from '../components/EventsShimmer';

// Initialize LocaleConfig at the top level
LocaleConfig.locales['am'] = {
  monthNames: ['መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዚያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ'],
  monthNamesShort: ['መስከ', 'ጥቅም', 'ህዳር', 'ታህሳ', 'ጥር', 'የካቲ', 'መጋቢ', 'ሚያዚ', 'ግንቦ', 'ሰኔ', 'ሐምሌ', 'ነሐሴ'],
  dayNames: ['ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ', 'እሑድ'],
  dayNamesShort: ['ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ', 'እሑድ'],
  today: 'ዛሬ'
};

LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today'
};

// Set default locale
LocaleConfig.defaultLocale = 'en';

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

// Add this constant after the imports
const AMHARIC_WEEKDAYS = ['ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ', 'እሑድ'];
const ENGLISH_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ENGLISH_WEEKDAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
  const isAmharic = i18n.language.startsWith('am');

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
              {isAmharic ? AMHARIC_WEEKDAYS[index] : ENGLISH_WEEKDAYS[index]}
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
          <View style={styles.weekTimeLabels}>
            {TIME_LABELS.map((label, index) => (
              <View key={index} style={styles.weekTimeLabel}>
                <Text style={styles.weekTimeLabelText}>{label}</Text>
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
                            styles.weekEventBlock,
                            {
                              top: topPosition,
                              height: Math.max(duration * HOUR_HEIGHT, 30),
                              width: DAY_COLUMN_WIDTH - 4,
                            },
                          ]}
                          onPress={() => onEventPress(event.id)}
                        >
                          <Text style={styles.weekEventTitle} numberOfLines={1}>
                            {event.title}
                          </Text>
                          <Text style={styles.weekEventTime}>
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
  const isAmharic = i18n.language.startsWith('am');

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
              const dayName = currentDate.getDay() === 0 ? AMHARIC_WEEKDAYS[6] : AMHARIC_WEEKDAYS[currentDate.getDay()-1];
              return `${dayName}፣ ${getEthiopianMonthName(ethDate.month)} ${ethDate.day}፣ ${ethDate.year}`;
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
          <View style={styles.dayTimeLabels}>
            {timeSlots.map((time, index) => (
              <View key={index} style={styles.dayTimeLabel}>
                <Text style={styles.dayTimeLabelText}>
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
                      styles.dayEventBlock,
                      {
                        top: startHour * HOUR_HEIGHT,
                        height: Math.max(duration * HOUR_HEIGHT, 30),
                        width: '90%',
                        left: '5%',
                      },
                    ]}
                    onPress={() => onEventPress(event.id)}
                  >
                    <Text style={styles.dayEventTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.dayEventTime}>
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

// Add this helper function at the top of the file
const getCategoryIdentifier = (category: any): string => {
  if (typeof category === 'string') return category.toLowerCase();
  if (typeof category === 'object') {
    return (category.slug || category.name || '').toLowerCase();
  }
  return '';
};

export default function EventsScreen() {
  const { t, i18n } = useTranslation();
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [allEvents, setAllEvents] = useState<Event[]>([]); // Store all events
  const [events, setEvents] = useState<Event[]>([]); // Store filtered events
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [forceRender, setForceRender] = useState(0); // Add this state
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Add state for calendar display type
  const isAmharic = i18n.language.startsWith('am');

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const calendarHeight = 350;
  const SCROLL_THRESHOLD = 50; // Reduced threshold for faster transition
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  // Sticky header animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-50)).current;
  const calendarTranslateY = scrollY.interpolate({
    inputRange: [0, calendarHeight],
    outputRange: [0, -calendarHeight],
    extrapolate: 'clamp'
  });

  // Add state for current day
  const currentDay = useMemo(() => {
    if (selectedDate) {
      return new Date(selectedDate);
    }
    return new Date();
  }, [selectedDate]);

  // Get current week days
  const currentWeekDays = useMemo(() => {
    const date = new Date(currentDay);
    const day = date.getDay();
    // Convert Sunday (0) to 7 to make Monday (1) the first day
    const adjustedDay = day === 0 ? 7 : day;
    const monday = new Date(date);
    monday.setDate(date.getDate() - adjustedDay + 1);
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return day;
    });
  }, [currentDay]);

  // Add new state for card height
  const CARD_HEIGHT = 200; // Adjust based on your event card height

  // Update the locale configuration effect
  useEffect(() => {
    LocaleConfig.locales['am'] = {
      monthNames: ['መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዚያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ'],
      monthNamesShort: ['መስከ', 'ጥቅም', 'ህዳር', 'ታህሳ', 'ጥር', 'የካቲ', 'መጋቢ', 'ሚያዚ', 'ግንቦ', 'ሰኔ', 'ሐምሌ', 'ነሐሴ'],
      dayNames: AMHARIC_WEEKDAYS,
      dayNamesShort: AMHARIC_WEEKDAYS,
      today: 'ዛሬ'
    };
    LocaleConfig.locales['en'] = {
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      dayNames: ENGLISH_WEEKDAYS_FULL,
      dayNamesShort: ENGLISH_WEEKDAYS,
      today: 'Today'
    };
    LocaleConfig.defaultLocale = i18n.language.startsWith('am') ? 'am' : 'en';
    setForceRender(prev => prev + 1); // Force re-render when language changes
  }, [i18n.language]);

  const loadEvents = async (pageNum: number, refresh = false) => {
    try {
      const isFirstPage = pageNum === 1;
      if (isFirstPage) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Load both events and categories in parallel on first load
      if (isFirstPage) {
        const [eventsResult, categoriesData] = await Promise.all([
          EventService.getEvents({
            page: pageNum,
            per_page: 10,
            orderby: 'date',
            order: 'DESC',
          }),
          EventService.getCategories(),
        ]);

        console.log('Loaded events:', {
          count: eventsResult.events.length,
          categories: eventsResult.events.map(e => e.categories)
        });

        setAllEvents(eventsResult.events);
        setCategories(categoriesData);
        setHasMore(eventsResult.hasMore);
        
        applyFilters(eventsResult.events);
      } else {
        // For subsequent pages, just load events
        const eventsResult = await EventService.getEvents({
          page: pageNum,
          per_page: 10,
          orderby: 'date',
          order: 'DESC',
        });

        setAllEvents(prev => [...prev, ...eventsResult.events]); // Store all new events
        setHasMore(eventsResult.hasMore);
        
        // Apply category and date filters to all events
        applyFilters([...allEvents, ...eventsResult.events]);
      }

      setError(null);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // New function to apply both category and date filters
  const applyFilters = (eventsList: Event[]) => {
    console.log('Applying filters with category:', selectedCategory);

    let filtered = eventsList;
    
    if (selectedCategory) {
      filtered = eventsList.filter(event => {
        return event.categories?.some(category => 
          category.slug === selectedCategory
        );
      });
    }

    // Then apply date filter if needed
    if (selectedDate) {
      filtered = filtered.filter(event => {
        if (!event.date) return false;
        const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
        return eventDate === selectedDate;
      });
    }

    console.log('Filtered events count:', filtered.length);
    setEvents(filtered);
    setFilteredEvents(filtered);
  };

  const handleRefresh = () => {
    setPage(1);
    loadEvents(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadEvents(nextPage);
    }
  };

  useEffect(() => {
    loadEvents(1);
  }, []);

  const handleDateSelect = (date: DateData) => {
    // If clicking the same date again, clear the date filter
    if (selectedDate === date.dateString) {
      setSelectedDate(null);
      // Reapply only category filter if exists
      if (selectedCategory) {
        const filtered = allEvents.filter(event => {
          return event.categories?.some(cat => 
            cat.slug === selectedCategory
          );
        });
        setEvents(filtered);
        setFilteredEvents(filtered);
      } else {
        setEvents(allEvents);
        setFilteredEvents(allEvents);
      }
      return;
    }

    // Apply filters with the new date value directly
    let filtered = allEvents;
    
    // First apply category filter if any
    if (selectedCategory) {
      filtered = filtered.filter(event => {
        return event.categories?.some(cat => 
          cat.slug === selectedCategory
        );
      });
    }

    // Then apply the new date filter
    filtered = filtered.filter(event => {
      if (!event.date) return false;
      const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
      return eventDate === date.dateString;
    });

    // Update all states at once
    setSelectedDate(date.dateString);
    setEvents(filtered);
    setFilteredEvents(filtered);
  };

  const handleCategorySelect = (category: string | null) => {
    console.log('Category selected:', category);
    
    // If selecting "All", clear both category and date filters
    if (category === null) {
      setSelectedCategory(null);
      setSelectedDate(null);
      setEvents(allEvents);
      setFilteredEvents(allEvents);
      setPage(1);
      return;
    }
    
    // Apply filters with the new category value directly
    let filtered = allEvents;
    
    filtered = allEvents.filter(event => {
      return event.categories?.some(cat => 
        cat.slug === category
      );
    });

    // Apply date filter if needed
    if (selectedDate) {
      filtered = filtered.filter(event => {
        if (!event.date) return false;
        const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
        return eventDate === selectedDate;
      });
    }

    // Update all states at once
    setSelectedCategory(category);
    setEvents(filtered);
    setFilteredEvents(filtered);
    setPage(1);
  };

  const handleEventPress = (eventId: number) => {
    navigation.navigate('EventDetails', { eventId });
  };

  const handleViewModeChange = (mode: 'month' | 'week' | 'day') => {
    setViewMode(mode);
    // Reset filters when changing view mode
    setSelectedDate(null);
    applyFilters(allEvents); // Apply filters to all events
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

  console.log('Current language:', i18n.language);
  console.log('Using dayNames:', isAmharic ? AMHARIC_WEEKDAYS : ENGLISH_WEEKDAYS);

  if (loading) {
    return <EventsShimmer />;
  }

  return (
    <View style={styles.container}>
      <EventFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        labels={{
          month: isAmharic ? 'ወር' : 'Month',
          week: isAmharic ? 'ሳምንት' : 'Week',
          day: isAmharic ? 'ቀን' : 'Day',
          all: isAmharic ? 'ሁሉም' : 'All',
          gubae: isAmharic ? 'ጉባኤ' : 'Gubae',
          sermon: isAmharic ? 'ስብከት' : 'Sermon'
        }}
      />
      
      {viewMode === 'month' && (
        <View style={styles.calendarWrapper}>
          {/* Event List */}
          <Animated.FlatList
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { 
                useNativeDriver: true,
                listener: (event: any) => {
                  const offsetY = event.nativeEvent.contentOffset.y;
                  setIsHeaderCollapsed(offsetY > SCROLL_THRESHOLD / 2);
                }
              }
            )}
            scrollEventThrottle={1}
            contentContainerStyle={styles.listContentContainer}
            style={styles.scrollView}
            data={selectedDate ? filteredEvents : events}
            renderItem={({ item }) => (
              <EventList
                events={[item]}
                onEventPress={handleEventPress}
                onRefresh={handleRefresh}
                onLoadMore={handleLoadMore}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                labels={{
                  noEvents: isAmharic ? 'ምንም መርሃግብር የለም' : 'No events',
                  loading: isAmharic ? 'በመጫን ላይ...' : 'Loading...',
                  error: isAmharic ? 'ስህተት ተከስቷል' : 'Error loading events',
                  retry: isAmharic ? 'እንደገና ሞክር' : 'Retry'
                }}
              />
            )}
            showsVerticalScrollIndicator={false}
          />

          {/* Main Calendar */}
          <Animated.View 
            style={[
              styles.calendarContainer,
              {
                transform: [{
                  translateY: scrollY.interpolate({
                    inputRange: [0, SCROLL_THRESHOLD],
                    outputRange: [0, -calendarHeight],
                    extrapolate: 'clamp'
                  })
                }],
                opacity: scrollY.interpolate({
                  inputRange: [0, SCROLL_THRESHOLD],
                  outputRange: [1, 0],
                  extrapolate: 'clamp'
                }),
                pointerEvents: isHeaderCollapsed ? 'none' : 'auto'
              }
            ]}
          >
            <Calendar
              key={`calendar-${i18n.language}-${forceRender}`}
              current={selectedDate || undefined}
              onDayPress={handleDateSelect}
              markedDates={getMarkedDates()}
              firstDay={1}
              theme={{
                selectedDayBackgroundColor: '#2196F3',
                todayTextColor: '#2196F3',
                dotColor: '#2196F3',
                textDayFontFamily: isAmharic ? 'YourEthiopianFont' : undefined,
                monthTextColor: '#000',
                textMonthFontSize: 16,
                textMonthFontWeight: 'bold',
                'stylesheet.calendar.header': {
                  dayTextAtIndex0: { 
                    color: '#666',
                    fontSize: 14,
                    fontWeight: '500',
                    width: 40,
                    textAlign: 'center',
                  },
                  dayTextAtIndex1: { 
                    color: '#666',
                    fontSize: 14,
                    fontWeight: '500',
                    width: 40,
                    textAlign: 'center',
                  },
                  dayTextAtIndex2: { 
                    color: '#666',
                    fontSize: 14,
                    fontWeight: '500',
                    width: 40,
                    textAlign: 'center',
                  },
                  dayTextAtIndex3: { 
                    color: '#666',
                    fontSize: 14,
                    fontWeight: '500',
                    width: 40,
                    textAlign: 'center',
                  },
                  dayTextAtIndex4: { 
                    color: '#666',
                    fontSize: 14,
                    fontWeight: '500',
                    width: 40,
                    textAlign: 'center',
                  },
                  dayTextAtIndex5: { 
                    color: '#666',
                    fontSize: 14,
                    fontWeight: '500',
                    width: 40,
                    textAlign: 'center',
                  },
                  dayTextAtIndex6: { 
                    color: '#666',
                    fontSize: 14,
                    fontWeight: '500',
                    width: 40,
                    textAlign: 'center',
                  },
                  week: {
                    marginTop: 7,
                    marginBottom: 7,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                  }
                },
              }}
              dayComponent={isAmharic ? renderEthiopianDay : undefined}
              hideArrows={true}
              hideExtraDays={true}
              hideDayNames={false}
              renderHeader={() => (
                <View style={styles.monthHeaderContainer}>
                  <TouchableOpacity style={styles.arrowButton}>
                    <Text style={styles.arrowText}>◀</Text>
                  </TouchableOpacity>
                  <View style={styles.monthYearContainer}>
                    <Text style={styles.monthHeaderText}>
                      {isAmharic ? formatMonthHeader(currentDay) : format(currentDay, 'MMMM yyyy')}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.arrowButton}>
                    <Text style={styles.arrowText}>▶</Text>
                  </TouchableOpacity>
                </View>
              )}
              customHeaderTitle={() => null}
              locale={i18n.language.startsWith('am') ? 'am' : 'en'}
              dayNames={isAmharic ? AMHARIC_WEEKDAYS : ENGLISH_WEEKDAYS}
              dayNamesShort={isAmharic ? AMHARIC_WEEKDAYS : ENGLISH_WEEKDAYS}
            />
          </Animated.View>

          {/* Sticky Header */}
          <Animated.View 
            key={`sticky-header-${i18n.language}-${forceRender}`}
            style={[
              styles.stickyHeader,
              {
                opacity: scrollY.interpolate({
                  inputRange: [0, SCROLL_THRESHOLD],
                  outputRange: [0, 1],
                  extrapolate: 'clamp'
                }),
                transform: [{
                  translateY: scrollY.interpolate({
                    inputRange: [0, SCROLL_THRESHOLD],
                    outputRange: [-50, 0],
                    extrapolate: 'clamp'
                  })
                }],
                pointerEvents: isHeaderCollapsed ? 'auto' : 'none'
              }
            ]}
          >
            <View style={styles.weekDaysHeader}>
              {currentWeekDays.map((day: Date, index: number) => (
                <View key={`${index}-${i18n.language}`} style={styles.weekDayColumn}>
                  <Text style={styles.weekDayText}>
                    {isAmharic ? AMHARIC_WEEKDAYS[index] : ENGLISH_WEEKDAYS[index]}
                  </Text>
                  <View style={[
                    styles.dayNumberContainer,
                    isSameDay(day, currentDay) && styles.selectedDayCircle
                  ]}>
                    <Text style={[
                      styles.dayNumberText,
                      isSameDay(day, currentDay) && styles.selectedDayText
                    ]}>
                      {isAmharic ? 
                        convertDateToEthiopian(day).day :
                        format(day, 'd')
                      }
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      )}
      {viewMode === 'week' && (
        <WeekView 
          events={events}
          onEventPress={handleEventPress}
          selectedDate={selectedDate ? new Date(selectedDate) : new Date()}
          onDayPress={handleDayPress}
        />
      )}
      {viewMode === 'day' && (
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
    height: 100,
  },
  dayViewCalendar: {
    height: 70,
  },
  timeGridContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  timeGridWrapper: {
    flexDirection: 'row',
    height: HOUR_HEIGHT * 24,
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

  // Week view styles
  weekContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timeHeaderSpacer: {
    width: TIME_COLUMN_WIDTH,
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
  weekTimeLabel: {
    height: HOUR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  weekTimeLabelText: {
    fontSize: 12,
    color: '#666',
  },
  weekEventBlock: {
    position: 'absolute',
    left: 5,
    backgroundColor: '#2196F3',
    borderRadius: 4,
    padding: 4,
    opacity: 0.9,
  },
  weekEventTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  weekEventTime: {
    color: '#fff',
    fontSize: 10,
  },
  weekTimeGridContainer: {
    flex: 1,
  },
  weekTimeLabels: {
    position: 'absolute',
    left: 0,
    width: 60,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    backgroundColor: '#fff',
    zIndex: 1,
  },

  // Day view styles
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
  dayEventBlock: {
    position: 'absolute',
    backgroundColor: '#2196F3',
    borderRadius: 4,
    padding: 4,
    margin: 2,
    opacity: 0.9,
    zIndex: 1,
  },
  dayEventTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dayEventTime: {
    color: '#fff',
    fontSize: 10,
  },
  dayTimeGridContainer: {
    flex: 1,
  },
  dayTimeLabels: {
    position: 'absolute',
    left: 0,
    width: 60,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  dayTimeLabel: {
    height: HOUR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  dayTimeLabelText: {
    fontSize: 12,
    color: '#666',
  },
  dayEventsGrid: {
    flexDirection: 'row',
    paddingLeft: 60,
  },

  // Calendar styles
  calendarWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  scrollView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  listContentContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
    marginTop: 350, // Match calendar height
    paddingBottom: 20,
  },
  calendarContainer: {
    height: 350,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1,
    backfaceVisibility: 'hidden',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  monthYearContainer: {
    alignItems: 'center',
  },
  yearText: {
    fontSize: 14,
    color: '#666',
  },
  weekDayColumn: {
    alignItems: 'center',
    width: 40,
  },
  selectedDayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  dayNumberContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberText: {
    fontSize: 12,
    color: '#000',
  },
  monthHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 1,
  },
  monthHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  arrowButton: {
    padding: 10,
  },
  arrowText: {
    fontSize: 18,
    color: '#666',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 1,
  },
  weekDayText: {
    fontSize: 14,
    color: '#666',
    width: 40,
    textAlign: 'center',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    backfaceVisibility: 'hidden',
  },
  cardContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
