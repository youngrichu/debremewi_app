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
import { 
  toEthiopian, 
  getEthiopianMonthName, 
  getEthiopianDayName, 
  ETHIOPIAN_MONTHS, 
  getDaysInEthiopianMonth,
  getEthiopianMonthRange,
  getVisibleDatesForEthiopianMonth,
  ethiopianToGregorian,
  isGregorianLeap
} from '../utils/ethiopianCalendar';
import { EventsShimmer } from '../components/EventsShimmer';
import { EthiopianCalendar } from '../components/EthiopianCalendar';

// Initialize LocaleConfig at the top level
LocaleConfig.locales['am'] = {
  monthNames: ['መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዚያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ'],
  monthNamesShort: ['መስከ', 'ጥቅም', 'ህዳር', 'ታህሳ', 'ጥር', 'የካቲ', 'መጋቢ', 'ሚያዚ', 'ግንቦ', 'ሰኔ', 'ሐምሌ', 'ነሐሴ'],
  dayNames: ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
  dayNamesShort: ['እሑድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
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
  try {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date passed to convertDateToEthiopian:', date);
      // Return fallback date
      return { year: 2016, month: 1, day: 1 };
    }
    return toEthiopian(date);
  } catch (error) {
    console.error('Error converting date to Ethiopian:', error);
    // Return fallback date
    return { year: 2016, month: 1, day: 1 };
  }
};

// Update the constants for weekdays
const AMHARIC_WEEKDAYS = ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'];
const ENGLISH_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ENGLISH_WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const WeekView = ({ 
  events, 
  onEventPress, 
  selectedDate,
  onDayPress,
}: { 
  events: Event[], 
  onEventPress: (event: Event) => void,
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
                          onPress={() => onEventPress(event)}
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
  onEventPress: (event: Event) => void,
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
                    onPress={() => onEventPress(event)}
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
  try {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    const ethiopianDate = convertDateToEthiopian(date);
    const daysInMonth = getDaysInEthiopianMonth(ethiopianDate.month, ethiopianDate.year);
    
    // Get the first day of the Ethiopian month in Gregorian calendar
    const firstDayGregorian = new Date(date);
    firstDayGregorian.setDate(1); // Start from first day of Gregorian month
    
    // Find the Gregorian date that corresponds to Ethiopian month's first day
    while (true) {
      const ethDate = toEthiopian(firstDayGregorian);
      if (ethDate.month === ethiopianDate.month && ethDate.year === ethiopianDate.year && ethDate.day === 1) {
        break;
      }
      firstDayGregorian.setDate(firstDayGregorian.getDate() + 1);
    }
    
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const gregorianDate = new Date(firstDayGregorian);
      gregorianDate.setDate(firstDayGregorian.getDate() + i);
      
      if (isNaN(gregorianDate.getTime())) {
        throw new Error('Invalid date generated');
      }
      
      return {
        gregorian: gregorianDate,
        ethiopian: {
          year: ethiopianDate.year,
          month: ethiopianDate.month,
          day: i + 1
        }
      };
    });

    return days;
  } catch (error) {
    console.error('Error in getEthiopianMonthDates:', error);
    throw error;
  }
};

// Update the formatMonthHeader function to use the same conversion as week and day views
const formatMonthHeader = (date: any) => {
  try {
    if (!date) {
      throw new Error('No date provided');
    }
    
    // Convert the date to a proper Date object
    const gregorianDate = new Date(date);
    if (isNaN(gregorianDate.getTime())) {
      throw new Error('Invalid date');
    }
    
    // Use the same conversion method as week/day views
    const ethiopianDate = toEthiopian(gregorianDate);
    
    // Return formatted Ethiopian month and year
    return `${getEthiopianMonthName(ethiopianDate.month)} ${ethiopianDate.year}`;
  } catch (error) {
    console.error('Error formatting month header:', error, {
      input: date,
      type: typeof date
    });
    return format(new Date(), 'MMMM yyyy'); // Fallback to current Gregorian date
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
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [forceRender, setForceRender] = useState(0);
  
  // Update the initial Ethiopian month state
  const [currentEthiopianMonth, setCurrentEthiopianMonth] = useState(() => {
    try {
      const today = new Date();
      const ethiopianDate = toEthiopian(today);
      return {
        year: ethiopianDate.year,
        month: ethiopianDate.month,
        day: ethiopianDate.day
      };
    } catch (error) {
      console.error('Error setting initial Ethiopian month:', error);
      // Return current Ethiopian date as fallback
      return {
        year: 2016,
        month: 6, // የካቲት
        day: 1
      };
    }
  });
  
  // Function to handle Ethiopian month navigation
  const handleEthiopianMonthChange = (direction: 'prev' | 'next') => {
    setCurrentEthiopianMonth(prev => {
      let newMonth = prev.month + (direction === 'next' ? 1 : -1);
      let newYear = prev.year;
      
      if (newMonth > 13) {
        newMonth = 1;
        newYear += 1;
      } else if (newMonth < 1) {
        newMonth = 13;
        newYear -= 1;
      }
      
      return {
        year: newYear,
        month: newMonth,
        day: 1
      };
    });
  };

  // Get Gregorian date range for current Ethiopian month
  const currentMonthRange = useMemo(() => {
    return getEthiopianMonthRange(currentEthiopianMonth.year, currentEthiopianMonth.month);
  }, [currentEthiopianMonth.year, currentEthiopianMonth.month]);

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
    // If using Amharic, ensure we're showing the correct Ethiopian day of week
    if (isAmharic) {
      // First, let's get the current Gregorian date as an Ethiopian date
      const ethDate = toEthiopian(date);
      
      // Get the current day of the week (0-6, where 0 is Sunday)
      const currentDayOfWeek = date.getDay();
      
      // Calculate the dates for the entire week
      return Array.from({ length: 7 }, (_, i) => {
        // Calculate day offset from Sunday (0)
        const dayOffset = i - currentDayOfWeek;
        
        // Create a new date by adding/subtracting days
        const dayDate = new Date(date);
        dayDate.setDate(date.getDate() + dayOffset);
        
        return dayDate;
      });
    } else {
      // For English calendar, use Sunday as the first day of the week
      const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const sunday = new Date(date);
      sunday.setDate(date.getDate() - day); // Go back to the Sunday of this week
      
      return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(sunday);
        day.setDate(sunday.getDate() + i);
        return day;
      });
    }
  }, [currentDay, isAmharic]);

  // Add new state for card height
  const CARD_HEIGHT = 200; // Adjust based on your event card height

  // Add new state for Gregorian calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Add new state for showing all events
  const [showAllEvents, setShowAllEvents] = useState(false);

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
            expand: 'occurrences',
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
          expand: 'occurrences',
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
    // Reset showAllEvents when selecting a date
    setShowAllEvents(false);

    // If clicking the same date again or clicking today's date
    const today = format(new Date(), 'yyyy-MM-dd');
    if (selectedDate === date.dateString || date.dateString === today) {
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

  const handleEventPress = (event: Event) => {
    const eventId = event.is_occurrence ? event.occurrence_parent_id : event.id;
    const occurrenceDate = event.is_occurrence ? event.date : null;
    const isOccurrence = event.is_occurrence === true || event.is_occurrence === 1;
    
    navigation.navigate('EventDetails', { 
      eventId: Number(eventId), 
      occurrenceDate,
      isOccurrence 
    });
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

  // Update the getMarkedDates function
  const getMarkedDates = (): MarkedDates => {
    const markedDates: MarkedDates = {};
    const today = format(new Date(), 'yyyy-MM-dd');

    // Mark today's date with light blue background
    markedDates[today] = {
      marked: false,
      selected: selectedDate === today,
      selectedColor: selectedDate === today ? '#2196F3' : '#E3F2FD',
    };

    // Mark dates that have events with dots
    events.forEach(event => {
      if (event.date) {
        try {
          const dateStr = format(new Date(event.date), 'yyyy-MM-dd');
          const isToday = dateStr === today;
          markedDates[dateStr] = {
            ...markedDates[dateStr],
            marked: true, // Show dot for events
            selected: dateStr === selectedDate || isToday,
            selectedColor: dateStr === selectedDate ? '#2196F3' : (isToday ? '#E3F2FD' : undefined),
          };
        } catch (error) {
          console.warn('Invalid date format:', event.date);
        }
      }
    });

    // If a date is selected but not marked with events, add it
    if (selectedDate && !markedDates[selectedDate]) {
      markedDates[selectedDate] = {
        marked: false,
        selected: true,
        selectedColor: '#2196F3',
      };
    }

    return markedDates;
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentMonth(newDate);
    setForceRender(prev => prev + 1); // Force calendar re-render
  };

  console.log('Current language:', i18n.language);
  console.log('Using dayNames:', isAmharic ? AMHARIC_WEEKDAYS : ENGLISH_WEEKDAYS);

  // Add helper function to get today's events
  const getTodayEvents = (eventsList: Event[]) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return eventsList.filter(event => {
      if (!event.date) return false;
      const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
      return eventDate === today;
    });
  };

  // Update calendar month header render
  const renderMonthHeader = () => (
    <View style={styles.monthHeaderContainer}>
      <TouchableOpacity 
        style={styles.arrowButton}
        onPress={() => handleEthiopianMonthChange('prev')}
      >
        <Text style={styles.arrowText}>◀</Text>
      </TouchableOpacity>
      <View style={styles.monthYearContainer}>
        <Text style={styles.monthHeaderText}>
          {isAmharic ? 
            `${getEthiopianMonthName(currentEthiopianMonth.month)} ${currentEthiopianMonth.year}` :
            format(currentMonthRange.start, 'MMMM yyyy')
          }
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.arrowButton}
        onPress={() => handleEthiopianMonthChange('next')}
      >
        <Text style={styles.arrowText}>▶</Text>
      </TouchableOpacity>
    </View>
  );

  // Get marked dates for Ethiopian calendar
  const getEthiopianMarkedDates = () => {
    const marked: { [key: string]: boolean } = {};
    
    events.forEach(event => {
      if (event.date) {
        const dateStr = format(new Date(event.date), 'yyyy-MM-dd');
        marked[dateStr] = true;
      }
    });
    
    return marked;
  };

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
            scrollEventThrottle={16}
            contentContainerStyle={styles.listContentContainer}
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
            bounces={true}
            overScrollMode="always"
            removeClippedSubviews={false}
            ListHeaderComponent={() => {
              const todayEvents = getTodayEvents(events);
              const hasEventsToday = todayEvents.length > 0;
              const isViewingDifferentDate = selectedDate && selectedDate !== format(new Date(), 'yyyy-MM-dd');
              const today = format(new Date(), 'yyyy-MM-dd');

              return (
                <>
                  <View style={styles.eventsHeaderContainer}>
                    <Text style={styles.eventsHeaderText}>
                      {isViewingDifferentDate ? 
                        (isAmharic ? "መርሃግብሮች" : "Events") :
                        (showAllEvents ? 
                          (isAmharic ? "ሁሉም መርሃግብሮች" : "All Events") :
                          (isAmharic ? "የዛሬ መርሃግብሮች" : "Today's Events")
                        )
                      }
                    </Text>
                    {!hasEventsToday && !isViewingDifferentDate && !showAllEvents && (
                      <View style={styles.noEventsContainer}>
                        <Text style={styles.noEventsText}>
                          {isAmharic ? "ዛሬ ምንም መርሃግብር የለም" : "No events today"}
                        </Text>
                        {events.length > 0 && (
                          <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => setShowAllEvents(true)}
                          >
                            <Text style={styles.viewAllButtonText}>
                              {isAmharic ? "ሁሉንም መርሃግብሮች አሳይ" : "View all events"}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                  {showAllEvents && !isViewingDifferentDate && (
                    <TouchableOpacity
                      style={styles.todayButton}
                      onPress={() => setShowAllEvents(false)}
                    >
                      <Text style={styles.todayButtonText}>
                        {isAmharic ? "የዛሬ መርሃግብሮች አሳይ" : "Show today's events"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              );
            }}
            data={selectedDate ? 
              filteredEvents : 
              (showAllEvents ? events : getTodayEvents(events))
            }
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
            {isAmharic ? (
              <EthiopianCalendar
                year={currentEthiopianMonth.year}
                month={currentEthiopianMonth.month}
                onDayPress={(date) => {
                  handleDateSelect({
                    dateString: format(date.gregorianDate, 'yyyy-MM-dd'),
                    day: date.gregorianDate.getDate(),
                    month: date.gregorianDate.getMonth() + 1,
                    year: date.gregorianDate.getFullYear(),
                    timestamp: date.gregorianDate.getTime()
                  });
                }}
                markedDates={getEthiopianMarkedDates()}
                selectedDate={selectedDate ? (() => {
                  const date = new Date(selectedDate);
                  const ethDate = toEthiopian(date);
                  return {
                    year: ethDate.year,
                    month: ethDate.month,
                    day: ethDate.day
                  };
                })() : null}
                onMonthChange={handleEthiopianMonthChange}
              />
            ) : (
              <Calendar
                key={`calendar-${i18n.language}-${forceRender}`}
                current={format(currentMonth, 'yyyy-MM-dd')}
                minDate={'2020-01-01'}
                maxDate={'2025-12-31'}
                onDayPress={handleDateSelect}
                markedDates={getMarkedDates()}
                firstDay={0}
                hideArrows={false}
                renderArrow={(direction: 'left' | 'right') => (
                  <Ionicons 
                    name={direction === 'left' ? 'chevron-back' : 'chevron-forward'} 
                    size={24} 
                    color="#2196F3" 
                  />
                )}
                enableSwipeMonths={true}
                style={styles.calendar}
                theme={{
                  selectedDayBackgroundColor: '#2196F3',
                  todayTextColor: '#2196F3',
                  todayBackgroundColor: '#E3F2FD',
                  dotColor: '#2196F3',
                  textMonthFontSize: 18,
                  textMonthFontWeight: 'bold',
                  textDayFontSize: 16,
                  textDayHeaderFontSize: 14,
                  'stylesheet.calendar.main': {
                    week: {
                      marginTop: 0,
                      marginBottom: 0,
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      height: 48,
                      borderBottomWidth: 1,
                      borderBottomColor: '#eee',
                    },
                    dayContainer: {
                      borderRightWidth: 1,
                      borderRightColor: '#eee',
                      flex: 1,
                    }
                  },
                  'stylesheet.day.basic': {
                    base: {
                      width: 48,
                      height: 48,
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    today: {
                      backgroundColor: '#E3F2FD',
                      borderRadius: 0,
                    },
                    selected: {
                      backgroundColor: '#2196F3',
                      borderRadius: 0,
                    }
                  },
                  'stylesheet.calendar.header': {
                    header: {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      marginBottom: 8,
                    },
                    monthText: {
                      fontSize: 20,
                      fontWeight: '600',
                      color: '#000',
                      marginBottom: 4,
                    },
                    dayHeader: {
                      marginTop: 2,
                      marginBottom: 8,
                      width: 48,
                      textAlign: 'center',
                      fontSize: 14,
                      color: '#666',
                      fontWeight: '500',
                    },
                    week: {
                      marginTop: 0,
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      borderBottomWidth: 1,
                      borderBottomColor: '#eee',
                      paddingBottom: 8,
                    }
                  }
                }}
              />
            )}
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
                    {isAmharic ? AMHARIC_WEEKDAYS[day.getDay()] : ENGLISH_WEEKDAYS[day.getDay()]}
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
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: '#eee',
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
  },
  scrollView: {
    flex: 1,
  },
  listContentContainer: {
    paddingTop: 370,
    paddingBottom: 120,
    minHeight: '100%',
    backgroundColor: '#fff',
  },
  calendarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 370,
    backgroundColor: '#fff',
    zIndex: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  ethiopianCalendar: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  ethiopianDayContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 2,
  },
  emptyDay: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  ethiopianDayText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    includeFontPadding: false,
  },
  todayContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
  },
  todayText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  selectedContainer: {
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dotContainer: {
    position: 'absolute',
    bottom: 4,
    alignItems: 'center',
    width: '100%',
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
    width: 48,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 1,
  },
  monthHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    minWidth: 200,
  },
  arrowButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
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
    width: 48,
    textAlign: 'center',
    paddingVertical: 8,
    fontWeight: '500',
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
  eventsHeaderContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
    width: '100%',
  },
  eventsHeaderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  noEventsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 0,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  viewAllButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 12,
    minWidth: 160,
    maxWidth: '80%',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  viewAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  todayButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 16,
    marginBottom: 16,
    minWidth: 160,
    maxWidth: '80%',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  todayButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
