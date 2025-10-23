// Debug script to test Ethiopian calendar conversions
const { format } = require('date-fns');

// Copy the essential functions for testing
const ETHIOPIAN_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዚያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
];

const ETHIOPIAN_DAYS = ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ'];
const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

function isGregorianLeap(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function ethiopianToGregorian(year, month, day) {
  if (month < 1 || month > 13 || day < 1 || 
      (month === 13 && day > (isGregorianLeap(year + 8) ? 6 : 5)) ||
      (month !== 13 && day > 30)) {
    throw new Error('Invalid Ethiopian date');
  }

  const monthMapping = GREGORIAN_TO_ETHIOPIAN.find(m => m.to[0] === month);
  if (!monthMapping) {
    throw new Error('Invalid Ethiopian month');
  }

  const gregorianYear = month <= 4 ? year + 7 : year + 8;
  const gregorianMonth = monthMapping.from[0];
  const gregorianDay = day + monthMapping.from[1] - monthMapping.to[1];

  console.log(`Converting Ethiopian ${year}-${month}-${day}:`);
  console.log(`  Mapping: ${JSON.stringify(monthMapping)}`);
  console.log(`  Calculated Gregorian: ${gregorianYear}-${gregorianMonth}-${gregorianDay}`);

  // Create date and handle month transitions
  const date = new Date(gregorianYear, gregorianMonth - 1, gregorianDay);
  
  console.log(`  Final Date: ${date.toDateString()}`);
  console.log(`  Weekday: ${date.getDay()} (${ENGLISH_DAYS[date.getDay()]})`);
  
  return date;
}

// Test specific dates
console.log('=== Testing Ethiopian Calendar Conversions ===\n');

// Test current date from the screenshot (October 23, 2025 / Tikimt 13, 2018)
console.log('Test 1: Tikimt 13, 2018 (should be around October 23, 2025)');
try {
  const result1 = ethiopianToGregorian(2018, 2, 13);
  console.log(`Result: ${result1.toDateString()} - ${ENGLISH_DAYS[result1.getDay()]}\n`);
} catch (error) {
  console.log(`Error: ${error.message}\n`);
}

// Test first day of Tikimt 2018
console.log('Test 2: Tikimt 1, 2018 (first day of the month)');
try {
  const result2 = ethiopianToGregorian(2018, 2, 1);
  console.log(`Result: ${result2.toDateString()} - ${ENGLISH_DAYS[result2.getDay()]}\n`);
} catch (error) {
  console.log(`Error: ${error.message}\n`);
}

// Test a few more dates to see the pattern
console.log('Test 3: Testing multiple dates in Tikimt 2018');
for (let day = 1; day <= 10; day++) {
  try {
    const result = ethiopianToGregorian(2018, 2, day);
    console.log(`Tikimt ${day}, 2018 = ${result.toDateString()} (${ENGLISH_DAYS[result.getDay()]})`);
  } catch (error) {
    console.log(`Tikimt ${day}, 2018 = Error: ${error.message}`);
  }
}

console.log('\n=== Checking October 2025 dates ===');
// Check what Ethiopian dates correspond to October 2025
const oct2025 = new Date(2025, 9, 23); // October 23, 2025
console.log(`October 23, 2025 is a ${ENGLISH_DAYS[oct2025.getDay()]}`);

// Let's also check the reverse conversion logic
console.log('\n=== Manual calculation check ===');
// For Tikimt (month 2), the mapping is { from: [10, 11], to: [2, 1] }
// This means Tikimt 1 starts on October 11
// So Tikimt 13 should be October 11 + 12 = October 23

const manualCheck = new Date(2025, 9, 23); // October 23, 2025 (month is 0-indexed)
console.log(`Manual check - October 23, 2025: ${manualCheck.toDateString()} (${ENGLISH_DAYS[manualCheck.getDay()]})`);