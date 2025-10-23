// Ethiopian calendar constants
import { format } from 'date-fns';

export const ETHIOPIAN_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዚያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
];

export const ETHIOPIAN_DAYS = ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ'];

// AbushakirJs-based constants for precise conversion
const constants = {
  _ethiopicEpoch: 2796,        // Fixed date of Ethiopian epoch (Meskerem 1, Year 1)
  _unixEpoch: 719163,          // Fixed date of Unix epoch (January 1, 1970)
  dayMilliSec: 86400000,       // Milliseconds in a day
};

// Helper functions for Ethiopian calendar conversion using fixed date system (Rata Die)
// Based on AbushakirJs algorithm: https://staging.dubaidebremewi.com/ethiopian-calendar-algorithm.md

export function isGregorianLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function isEthiopianLeap(year: number): boolean {
  return year % 4 === 3;
}

// Convert Ethiopian date to fixed date (Rata Die) - AbushakirJs algorithm
function fixedFromEthiopic(year: number, month: number, day: number): number {
  return constants._ethiopicEpoch + 365 * (year - 1) + Math.floor(year / 4) + 30 * (month - 1) + day - 1;
}

// Convert fixed date to Ethiopian date - AbushakirJs algorithm
function ethiopicFromFixed(fixed: number): { year: number; month: number; day: number } {
  const daysSinceEpoch = fixed - constants._ethiopicEpoch;
  const year = Math.floor((4 * daysSinceEpoch + 1463) / 1461);
  const yearStart = fixedFromEthiopic(year, 1, 1);
  const dayOfYear = fixed - yearStart + 1;
  const month = Math.floor((dayOfYear - 1) / 30) + 1;
  const day = dayOfYear - 30 * (month - 1);
  
  return { year, month, day };
}

// Convert Unix timestamp to fixed date
function fixedFromUnix(unixMs: number): number {
  const daysSinceUnixEpoch = Math.floor(unixMs / constants.dayMilliSec);
  return constants._unixEpoch + daysSinceUnixEpoch;
}

// Convert fixed date to Unix timestamp
function unixFromFixed(fixed: number): number {
  const daysSinceUnixEpoch = fixed - constants._unixEpoch;
  return daysSinceUnixEpoch * constants.dayMilliSec;
}

export function toEthiopian(date: Date): { year: number; month: number; day: number } {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  const unixMs = date.getTime();
  const fixed = fixedFromUnix(unixMs);
  return ethiopicFromFixed(fixed);
}

export function ethiopianToGregorian(year: number, month: number, day: number): Date {
  if (month < 1 || month > 13 || day < 1 || 
      (month === 13 && day > (isEthiopianLeap(year) ? 6 : 5)) ||
      (month !== 13 && day > 30)) {
    throw new Error('Invalid Ethiopian date');
  }

  const fixed = fixedFromEthiopic(year, month, day);
  const unixMs = unixFromFixed(fixed);
  
  return new Date(unixMs);
}

export function getDaysInEthiopianMonth(month: number, year: number): number {
  if (month < 1 || month > 13) {
    throw new Error('Invalid Ethiopian month');
  }
  
  if (month === 13) {
    return isEthiopianLeap(year) ? 6 : 5;
  }
  
  return 30;
}

export function getVisibleDatesForEthiopianMonth(ethiopianYear: number, ethiopianMonth: number): Array<{
  gregorianDate: Date;
  ethiopianDay: number;
  weekDay: number;
}> {
  try {
    console.log('Debug: Starting getVisibleDatesForEthiopianMonth', {
      ethiopianYear,
      ethiopianMonth,
      daysInMonth: getDaysInEthiopianMonth(ethiopianMonth, ethiopianYear)
    });

    const dates = [];
  const daysInMonth = getDaysInEthiopianMonth(ethiopianMonth, ethiopianYear);
  
    // Get first day of the month
    const firstDayGregorian = ethiopianToGregorian(ethiopianYear, ethiopianMonth, 1);
    const startWeekDay = firstDayGregorian.getDay();
    
    console.log('Debug: First day info:', {
      firstDayGregorian: firstDayGregorian.toISOString(),
      startWeekDay,
      ethiopianDate: `${ethiopianYear}-${ethiopianMonth}-1`
    });

    // Fill in empty spaces for previous month
    for (let i = 0; i < startWeekDay; i++) {
      const prevDate = new Date(firstDayGregorian);
      prevDate.setDate(firstDayGregorian.getDate() - (startWeekDay - i));
      dates.push({
        gregorianDate: prevDate,
        ethiopianDay: 0,
        weekDay: i
      });
    }
    console.log('Debug: Added empty days at start:', startWeekDay);

    // Add all days of the current Ethiopian month
    for (let day = 1; day <= daysInMonth; day++) {
      const gregorianDate = ethiopianToGregorian(ethiopianYear, ethiopianMonth, day);
      dates.push({
        gregorianDate: new Date(gregorianDate),
        ethiopianDay: day,
        weekDay: (startWeekDay + day - 1) % 7
      });
    }
    console.log('Debug: Added month days:', daysInMonth);
    console.log('Debug: Current total days:', dates.length);

    // Fill remaining days in the last week
    const totalDays = dates.length;
    const remainingDays = (7 - (totalDays % 7)) % 7;
    console.log('Debug: Remaining days to add:', remainingDays);
    
    if (remainingDays > 0) {
      const lastGregorianDate = ethiopianToGregorian(ethiopianYear, ethiopianMonth, daysInMonth);
      for (let i = 0; i < remainingDays; i++) {
        const nextDate = new Date(lastGregorianDate);
        nextDate.setDate(lastGregorianDate.getDate() + i + 1);
        dates.push({
          gregorianDate: nextDate,
          ethiopianDay: 0,
          weekDay: (totalDays + i) % 7
        });
      }
    }

    console.log('Debug: Final dates array:', {
      totalLength: dates.length,
      emptyAtStart: startWeekDay,
      actualDays: dates.filter(d => d.ethiopianDay > 0).length,
      emptyAtEnd: remainingDays,
      firstDay: dates[0],
      lastDay: dates[dates.length - 1],
      allDays: dates.map(d => d.ethiopianDay).join(',')
  });
  
  return dates;
  } catch (error) {
    console.error('Error in getVisibleDatesForEthiopianMonth:', error);
    return [];
  }
}

export function getEthiopianMonthName(month: number): string {
  return ETHIOPIAN_MONTHS[month - 1] || ETHIOPIAN_MONTHS[0];
}

export function getEthiopianDayName(dayIndex: number): string {
  return ETHIOPIAN_DAYS[dayIndex] || ETHIOPIAN_DAYS[0];
}

export function formatEthiopianDate(date: Date): string {
  const ethiopian = toEthiopian(date);
  const dayName = getEthiopianDayName(date.getDay());
  const monthName = getEthiopianMonthName(ethiopian.month);
  return `${dayName} ${ethiopian.day} ${monthName} ${ethiopian.year}`;
}

export function getEthiopianMonthRange(year: number, month: number): { start: Date; end: Date } {
  try {
    if (month < 1 || month > 13) {
      throw new Error('Invalid Ethiopian month');
    }
    const start = ethiopianToGregorian(year, month, 1);
    const end = ethiopianToGregorian(year, month, getDaysInEthiopianMonth(month, year));
    return { start, end };
  } catch (error) {
    console.error('Error getting Ethiopian month range:', error);
    const today = new Date();
    return {
      start: today,
      end: today
    };
  }
}