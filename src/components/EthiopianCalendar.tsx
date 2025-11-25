import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { format } from 'date-fns';
import {
  ETHIOPIAN_DAYS,
  ETHIOPIAN_MONTHS,
  ethiopianToGregorian,
  getDaysInEthiopianMonth,
  toEthiopian
} from '../utils/ethiopianCalendar';
import { Ionicons } from '@expo/vector-icons';
import { getFontSize } from '../utils/responsive';

interface EthiopianCalendarProps {
  year: number;
  month: number;
  onDayPress?: (date: { year: number; month: number; day: number; gregorianDate: Date }) => void;
  markedDates?: { [key: string]: boolean };
  selectedDate?: { year: number; month: number; day: number } | null;
  onMonthChange?: (direction: 'prev' | 'next') => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;

export const EthiopianCalendar: React.FC<EthiopianCalendarProps> = ({
  year,
  month,
  onDayPress,
  markedDates = {},
  selectedDate = null,
  onMonthChange,
}) => {
  const startX = useRef(0);
  const moveX = useRef(0);

  const handleTouchStart = (event: any) => {
    startX.current = event.nativeEvent.pageX;
  };

  const handleTouchMove = (event: any) => {
    moveX.current = event.nativeEvent.pageX;
  };

  const handleTouchEnd = () => {
    const diff = moveX.current - startX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      onMonthChange?.(diff > 0 ? 'prev' : 'next');
    }
  };

  // Get current Ethiopian date
  const today = toEthiopian(new Date());

  // Get the first day of the month in Gregorian calendar
  const firstDayGregorian = ethiopianToGregorian(year, month, 1);
  const startWeekDay = firstDayGregorian.getDay();

  // Get number of days in the month
  const daysInMonth = getDaysInEthiopianMonth(month, year);

  // Calculate days to show in calendar grid
  const calendarDays: Array<{
    ethiopianDay: number | null;
    gregorianDate: Date | null;
    isCurrentMonth: boolean;
  }> = [];

  // Add empty days for padding at start
  for (let i = 0; i < startWeekDay; i++) {
    const prevDate = new Date(firstDayGregorian);
    prevDate.setDate(firstDayGregorian.getDate() - (startWeekDay - i));
    calendarDays.push({
      ethiopianDay: null,
      gregorianDate: prevDate,
      isCurrentMonth: false
    });
  }

  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const gregorianDate = ethiopianToGregorian(year, month, day);
    calendarDays.push({
      ethiopianDay: day,
      gregorianDate,
      isCurrentMonth: true
    });
  }

  // Add empty days for padding at end
  const remainingDays = 42 - calendarDays.length; // 6 rows * 7 days = 42
  if (remainingDays > 0) {
    const lastGregorianDate = ethiopianToGregorian(year, month, daysInMonth);
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(lastGregorianDate);
      nextDate.setDate(lastGregorianDate.getDate() + i);
      calendarDays.push({
        ethiopianDay: null,
        gregorianDate: nextDate,
        isCurrentMonth: false
      });
    }
  }

  // Split days into weeks
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      {/* Month/Year Header with Navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => onMonthChange?.('prev')}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="chevron-back" size={24} color="#2196F3" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.monthText}>
            {ETHIOPIAN_MONTHS[month - 1]}
          </Text>
          <Text style={styles.yearText}>
            {year} ዓ.ም.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => onMonthChange?.('next')}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="chevron-forward" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Calendar Content */}
      <View
        style={styles.calendarContent}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Weekday headers */}
        <View style={styles.weekdayHeader}>
          {ETHIOPIAN_DAYS.map((day, index) => (
            <View key={index} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.week}>
              {week.map((day, dayIndex) => {
                const isSelected = day.ethiopianDay !== null &&
                  selectedDate?.year === year &&
                  selectedDate?.month === month &&
                  selectedDate?.day === day.ethiopianDay;

                const isToday = day.ethiopianDay !== null &&
                  today.year === year &&
                  today.month === month &&
                  today.day === day.ethiopianDay;

                // Only mark events on days that belong to the current month
                // Don't show event markers on padding days (previous/next month)
                const isMarked = day.isCurrentMonth &&
                  day.gregorianDate &&
                  markedDates[format(day.gregorianDate, 'yyyy-MM-dd')];

                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dayCell,
                      !day.isCurrentMonth && styles.outsideMonth,
                      isSelected && styles.selectedDay,
                      isToday && styles.todayCell
                    ]}
                    onPress={() => {
                      if (day.ethiopianDay && day.gregorianDate && onDayPress) {
                        onDayPress({
                          year,
                          month,
                          day: day.ethiopianDay,
                          gregorianDate: day.gregorianDate
                        });
                      }
                    }}
                    disabled={!day.ethiopianDay}
                  >
                    <Text style={[
                      styles.dayText,
                      !day.isCurrentMonth && styles.outsideMonthText,
                      isSelected && styles.selectedDayText,
                      isToday && styles.todayText
                    ]}>
                      {day.ethiopianDay || ''}
                    </Text>
                    {isMarked && <View style={[
                      styles.dot,
                      (isSelected || isToday) && styles.whiteDot
                    ]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  headerTextContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 16,
  },
  monthText: {
    fontSize: getFontSize(18),
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  yearText: {
    fontSize: getFontSize(14),
    color: '#666',
  },
  navButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
  },
  calendarContent: {
    width: '100%',
  },
  weekdayHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: getFontSize(14),
    color: '#666',
    fontWeight: '500',
  },
  grid: {
    width: '100%',
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  week: {
    flexDirection: 'row',
    height: 48,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  dayText: {
    fontSize: getFontSize(16),
    color: '#000',
  },
  outsideMonth: {
    backgroundColor: '#f8f8f8',
  },
  outsideMonthText: {
    color: '#ccc',
  },
  selectedDay: {
    backgroundColor: '#2196F3',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  todayCell: {
    backgroundColor: '#E3F2FD',
  },
  todayText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2196F3',
  },
  whiteDot: {
    backgroundColor: '#fff',
  },
}); 