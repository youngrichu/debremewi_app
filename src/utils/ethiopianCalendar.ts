// Ethiopian calendar constants
export const ETHIOPIAN_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዚያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
];

export const ETHIOPIAN_DAYS = ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ'];

// Constants for Ethiopian calendar calculations
const JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856; // Amete Mihret epoch
const GREGORIAN_EPOCH = 1721426;

export function toEthiopian(year: number, month: number, day: number): { year: number; month: number; day: number } {
  try {
    // Convert Gregorian date to JDN
    let jdn = gregorianToJDN(year, month, day);
    
    // Convert JDN to Ethiopian date
    let r = (jdn - JD_EPOCH_OFFSET_AMETE_MIHRET) % 1461;
    let n = r % 365 + 365 * Math.floor(r / 1460);
    
    let ethiopianYear = 4 * Math.floor((jdn - JD_EPOCH_OFFSET_AMETE_MIHRET) / 1461) + 
                       Math.floor(r / 365) - Math.floor(r / 1460);
    let ethiopianMonth = Math.floor(n / 30) + 1;
    let ethiopianDay = (n % 30) + 1;

    return {
      year: ethiopianYear,
      month: ethiopianMonth,
      day: ethiopianDay
    };
  } catch (error) {
    console.error('Error in Ethiopian date conversion:', error);
    throw error;
  }
}

function gregorianToJDN(year: number, month: number, day: number): number {
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 
         Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// Helper function to convert Date object to Ethiopian date
export function dateToEthiopian(date: Date | string): { year: number; month: number; day: number } {
  const d = new Date(date);
  return toEthiopian(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function getEthiopianMonthName(month: number): string {
  if (month < 1 || month > 13) {
    throw new Error('Invalid Ethiopian month number');
  }
  return ETHIOPIAN_MONTHS[month - 1];
}

export function getEthiopianDayName(dayIndex: number): string {
  if (dayIndex < 0 || dayIndex > 6) {
    throw new Error('Invalid day index');
  }
  return ETHIOPIAN_DAYS[dayIndex];
}

export function formatEthiopianDate(date: Date | string): string {
  const ethiopian = dateToEthiopian(date);
  const d = new Date(date);
  const dayName = getEthiopianDayName(d.getDay());
  const monthName = getEthiopianMonthName(ethiopian.month);
  
  return `${dayName} ${ethiopian.day} ${monthName} ${ethiopian.year}`;
}

// Helper function to create a date that's timezone-safe
export function createDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

// Debug helper
export function debugDateConversion(date: Date | string) {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  console.log({
    input: date,
    parsed: inputDate.toString(),
    gregorian: {
      year: inputDate.getFullYear(),
      month: inputDate.getMonth() + 1,
      day: inputDate.getDate()
    },
    ethiopian: toEthiopian(inputDate)
  });
}

// Get number of days in Ethiopian month
export function getDaysInEthiopianMonth(month: number, year: number): number {
  if (month === 13) {
    // Pagume - check for leap year
    return isEthiopianLeapYear(year) ? 6 : 5;
  }
  return 30; // All other months have 30 days
}

// Check if Ethiopian year is leap year
export function isEthiopianLeapYear(year: number): boolean {
  return (year + 1) % 4 === 0;
}

// Get Ethiopian month range in Gregorian dates
export function getEthiopianMonthRange(ethiopianYear: number, ethiopianMonth: number): {
  start: Date;
  end: Date;
} {
  // Implementation needed - convert Ethiopian month start/end to Gregorian dates
  // This will help with event filtering
  return {
    start: new Date(), // Convert first day of Ethiopian month to Gregorian
    end: new Date(),   // Convert last day of Ethiopian month to Gregorian
  };
} 