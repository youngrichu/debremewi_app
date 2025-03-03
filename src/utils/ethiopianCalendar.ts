// Ethiopian calendar constants
import { format } from 'date-fns';

export const ETHIOPIAN_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዚያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
];

export const ETHIOPIAN_DAYS = ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ'];

// Mapping of Gregorian months to Ethiopian months
const GREGORIAN_TO_ETHIOPIAN = [
  { from: [9, 11], to: [1, 1] },    // Meskerem
  { from: [10, 11], to: [2, 1] },   // Tikimt
  { from: [11, 10], to: [3, 1] },   // Hidar
  { from: [12, 10], to: [4, 1] },   // Tahsas
  { from: [1, 9], to: [5, 1] },     // Tir
  { from: [2, 8], to: [6, 1] },     // Yekatit
  { from: [3, 10], to: [7, 1] },    // Megabit
  { from: [4, 9], to: [8, 1] },     // Miyazia
  { from: [5, 9], to: [9, 1] },     // Ginbot
  { from: [6, 8], to: [10, 1] },    // Sene
  { from: [7, 8], to: [11, 1] },    // Hamle
  { from: [8, 7], to: [12, 1] },    // Nehase
  { from: [9, 6], to: [13, 1] },    // Pagume
];

export function isGregorianLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function toEthiopian(date: Date): { year: number; month: number; day: number } {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1;
  const gregorianDay = date.getDate();
  
  // Define Ethiopian calendar start reference points
  const monthStarts = [
    { ethMonth: 1, ethDay: 1, gregMonth: 9, gregDay: 11 },  // Meskerem 1
    { ethMonth: 2, ethDay: 1, gregMonth: 10, gregDay: 11 }, // Tikimt 1
    { ethMonth: 3, ethDay: 1, gregMonth: 11, gregDay: 10 }, // Hidar 1
    { ethMonth: 4, ethDay: 1, gregMonth: 12, gregDay: 10 }, // Tahsas 1
    { ethMonth: 5, ethDay: 1, gregMonth: 1, gregDay: 9 },   // Tir 1
    { ethMonth: 6, ethDay: 1, gregMonth: 2, gregDay: 8 },   // Yekatit 1
    { ethMonth: 7, ethDay: 1, gregMonth: 3, gregDay: 10 },  // Megabit 1
    { ethMonth: 8, ethDay: 1, gregMonth: 4, gregDay: 9 },   // Miyazia 1
    { ethMonth: 9, ethDay: 1, gregMonth: 5, gregDay: 9 },   // Ginbot 1
    { ethMonth: 10, ethDay: 1, gregMonth: 6, gregDay: 8 },  // Sene 1
    { ethMonth: 11, ethDay: 1, gregMonth: 7, gregDay: 8 },  // Hamle 1
    { ethMonth: 12, ethDay: 1, gregMonth: 8, gregDay: 7 },  // Nehase 1
    { ethMonth: 13, ethDay: 1, gregMonth: 9, gregDay: 6 },  // Pagume 1
  ];

  // Find the correct month segment
  let currentMonthStart = null;
  let nextMonthStart = null;

  for (let i = 0; i < monthStarts.length; i++) {
    const current = monthStarts[i];
    const next = monthStarts[(i + 1) % monthStarts.length];
    
    // Check if we're in special case - between end of year and start of year
    if (i === monthStarts.length - 1) {
      // Handle Pagume to Meskerem transition
      if ((gregorianMonth === 9 && gregorianDay >= current.gregDay && gregorianDay < monthStarts[0].gregDay)) {
        currentMonthStart = current;
        nextMonthStart = monthStarts[0];
        break;
      }
    } else if (
      // Normal case - current month
      (gregorianMonth === current.gregMonth && gregorianDay >= current.gregDay) ||
      // Or previous month but before next month starts
      (gregorianMonth === next.gregMonth && gregorianDay < next.gregDay)
    ) {
      currentMonthStart = current;
      nextMonthStart = next;
      break;
    }
  }

  // If we didn't find a match (shouldn't happen if mapping is complete)
  if (!currentMonthStart) {
    throw new Error(`Could not determine Ethiopian date for ${gregorianYear}-${gregorianMonth}-${gregorianDay}`);
  }

  // Calculate days since Ethiopian month started
  let daysSinceMonthStart = 0;
  
  if (gregorianMonth === currentMonthStart.gregMonth) {
    // Same Gregorian month
    daysSinceMonthStart = gregorianDay - currentMonthStart.gregDay;
  } else {
    // Different Gregorian month - need to count days in between
    const daysInStartMonth = new Date(
      gregorianMonth === 1 ? gregorianYear - 1 : gregorianYear, 
      currentMonthStart.gregMonth, 
      0
    ).getDate();
    
    // Days remaining in the start month
    daysSinceMonthStart = daysInStartMonth - currentMonthStart.gregDay + 1;
    
    // Add days of any months in between (rarely needed but complete)
    for (let m = currentMonthStart.gregMonth + 1; m < gregorianMonth; m++) {
      const daysInMonth = new Date(gregorianYear, m, 0).getDate();
      daysSinceMonthStart += daysInMonth;
    }
    
    // Add days in the current month
    daysSinceMonthStart += gregorianDay - 1;
  }
  
  // Calculate Ethiopian date components
  const ethiopianDay = currentMonthStart.ethDay + daysSinceMonthStart;
  
  // Handle day overflow
  let ethiopianMonth = currentMonthStart.ethMonth;
  let ethiopianYear = currentMonthStart.ethMonth >= 1 && currentMonthStart.ethMonth <= 4 ? 
    gregorianYear - 7 : gregorianYear - 8;
  
  // Handle special case for end of Ethiopian year
  if (currentMonthStart.ethMonth === 13) {
    const pagumeDays = isGregorianLeap(ethiopianYear) ? 6 : 5;
    
    // If we exceed Pagume days, we're in the next year
    if (ethiopianDay > pagumeDays) {
      ethiopianMonth = 1; // Meskerem
      ethiopianYear += 1;
      return { year: ethiopianYear, month: ethiopianMonth, day: ethiopianDay - pagumeDays };
    }
  } else {
    // Handle month overflow (for months with 30 days)
    if (ethiopianDay > 30) {
      ethiopianMonth += 1;
      if (ethiopianMonth > 13) {
        ethiopianMonth = 1;
        ethiopianYear += 1;
      }
      return { year: ethiopianYear, month: ethiopianMonth, day: ethiopianDay - 30 };
    }
  }
  
  return { year: ethiopianYear, month: ethiopianMonth, day: ethiopianDay };
}

export function ethiopianToGregorian(year: number, month: number, day: number): Date {
  if (month < 1 || month > 13 || day < 1 || 
      (month === 13 && day > (isGregorianLeap(year + 8) ? 6 : 5)) ||
      (month !== 13 && day > 30)) {
    throw new Error('Invalid Ethiopian date');
  }

  const monthMapping = GREGORIAN_TO_ETHIOPIAN.find(m => m.to[0] === month);
  if (!monthMapping) {
    throw new Error('Invalid Ethiopian month');
  }

  const gregorianYear = month >= 9 ? year + 7 : year + 8;
  const gregorianMonth = monthMapping.from[0];
  const gregorianDay = day + monthMapping.from[1] - monthMapping.to[1];

  // Create date and handle month transitions
  const date = new Date(Date.UTC(gregorianYear, gregorianMonth - 1, gregorianDay));
  
  // Validate the resulting date
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date conversion result');
  }

  return date;
}

export function getDaysInEthiopianMonth(month: number, year: number): number {
  if (month < 1 || month > 13) {
    throw new Error('Invalid Ethiopian month');
  }
  
  if (month === 13) {
    return isGregorianLeap(year + 8) ? 6 : 5;
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
    const startWeekDay = firstDayGregorian.getUTCDay();
    
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