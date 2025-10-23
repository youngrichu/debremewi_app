// Test the new AbushakirJs-based Ethiopian calendar algorithm
// Based on: https://staging.dubaidebremewi.com/ethiopian-calendar-algorithm.md

// Constants from AbushakirJs
const constants = {
  _ethiopicEpoch: 2796,        // Fixed date of Ethiopian epoch (Meskerem 1, Year 1)
  _unixEpoch: 719163,          // Fixed date of Unix epoch (January 1, 1970)
  dayMilliSec: 86400000,       // Milliseconds in a day
};

// Helper functions
function isEthiopianLeap(year) {
  return year % 4 === 3;
}

// Convert Ethiopian date to fixed date (Rata Die) - AbushakirJs algorithm
function fixedFromEthiopic(year, month, day) {
  return constants._ethiopicEpoch + 365 * (year - 1) + Math.floor(year / 4) + 30 * (month - 1) + day - 1;
}

// Convert fixed date to Ethiopian date - AbushakirJs algorithm
function ethiopicFromFixed(fixed) {
  const daysSinceEpoch = fixed - constants._ethiopicEpoch;
  const year = Math.floor((4 * daysSinceEpoch + 1463) / 1461);
  const yearStart = fixedFromEthiopic(year, 1, 1);
  const dayOfYear = fixed - yearStart + 1;
  const month = Math.floor((dayOfYear - 1) / 30) + 1;
  const day = dayOfYear - 30 * (month - 1);
  
  return { year, month, day };
}

// Convert Unix timestamp to fixed date
function fixedFromUnix(unixMs) {
  const daysSinceUnixEpoch = Math.floor(unixMs / constants.dayMilliSec);
  return constants._unixEpoch + daysSinceUnixEpoch;
}

// Convert fixed date to Unix timestamp
function unixFromFixed(fixed) {
  const daysSinceUnixEpoch = fixed - constants._unixEpoch;
  return daysSinceUnixEpoch * constants.dayMilliSec;
}

// Main conversion functions
function toEthiopian(date) {
  const unixMs = date.getTime();
  const fixed = fixedFromUnix(unixMs);
  return ethiopicFromFixed(fixed);
}

function ethiopianToGregorian(year, month, day) {
  const fixed = fixedFromEthiopic(year, month, day);
  const unixMs = unixFromFixed(fixed);
  return new Date(unixMs);
}

// Test cases
console.log('=== Testing AbushakirJs Algorithm ===\n');

// Test 1: Known Ethiopian New Year dates
console.log('1. Ethiopian New Year Tests:');
const newYearTests = [
  { eth: { year: 2017, month: 1, day: 1 }, expectedGreg: '2024-09-11' },
  { eth: { year: 2018, month: 1, day: 1 }, expectedGreg: '2025-09-11' },
  { eth: { year: 2019, month: 1, day: 1 }, expectedGreg: '2026-09-11' },
];

newYearTests.forEach(test => {
  const gregorian = ethiopianToGregorian(test.eth.year, test.eth.month, test.eth.day);
  const gregStr = gregorian.toISOString().split('T')[0];
  const match = gregStr === test.expectedGreg ? '✓' : '✗';
  console.log(`   ${match} Meskerem 1, ${test.eth.year} → ${gregStr} (expected: ${test.expectedGreg})`);
});

// Test 2: Round-trip conversions
console.log('\n2. Round-trip Conversion Tests:');
const roundTripTests = [
  new Date('2024-09-11'), // Ethiopian New Year 2017
  new Date('2025-01-01'), // Gregorian New Year
  new Date('2025-10-22'), // Random date
];

roundTripTests.forEach(originalDate => {
  const ethiopian = toEthiopian(originalDate);
  const backToGregorian = ethiopianToGregorian(ethiopian.year, ethiopian.month, ethiopian.day);
  
  const originalStr = originalDate.toISOString().split('T')[0];
  const backStr = backToGregorian.toISOString().split('T')[0];
  const match = originalStr === backStr ? '✓' : '✗';
  
  console.log(`   ${match} ${originalStr} → ${ethiopian.year}/${ethiopian.month}/${ethiopian.day} → ${backStr}`);
});

// Test 3: Ethiopian leap years
console.log('\n3. Ethiopian Leap Year Tests:');
const leapYearTests = [
  { year: 2015, expected: true },  // 2015 % 4 === 3
  { year: 2016, expected: false }, // 2016 % 4 === 0
  { year: 2017, expected: false }, // 2017 % 4 === 1
  { year: 2018, expected: false }, // 2018 % 4 === 2
  { year: 2019, expected: true },  // 2019 % 4 === 3
];

leapYearTests.forEach(test => {
  const isLeap = isEthiopianLeap(test.year);
  const match = isLeap === test.expected ? '✓' : '✗';
  console.log(`   ${match} Year ${test.year}: ${isLeap ? 'Leap' : 'Regular'} (expected: ${test.expected ? 'Leap' : 'Regular'})`);
});

// Test 4: Weekday alignment test
console.log('\n4. Weekday Alignment Test:');
const weekdayTest = new Date('2025-10-22'); // Wednesday
const ethiopianDate = toEthiopian(weekdayTest);
const backToGregorian = ethiopianToGregorian(ethiopianDate.year, ethiopianDate.month, ethiopianDate.day);

const originalWeekday = weekdayTest.getDay(); // 0=Sunday, 1=Monday, etc.
const convertedWeekday = backToGregorian.getDay();

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const match = originalWeekday === convertedWeekday ? '✓' : '✗';

console.log(`   ${match} ${weekdayTest.toISOString().split('T')[0]} (${weekdays[originalWeekday]})`);
console.log(`     → Ethiopian: ${ethiopianDate.year}/${ethiopianDate.month}/${ethiopianDate.day}`);
console.log(`     → Back to Gregorian: ${backToGregorian.toISOString().split('T')[0]} (${weekdays[convertedWeekday]})`);

// Test 5: Specific conversion examples from documentation
console.log('\n5. Documentation Examples:');
const docTests = [
  { eth: { year: 2017, month: 1, day: 1 }, desc: 'Meskerem 1, 2017' },
  { eth: { year: 2018, month: 7, day: 15 }, desc: 'Tikimt 15, 2018' },
];

docTests.forEach(test => {
  const gregorian = ethiopianToGregorian(test.eth.year, test.eth.month, test.eth.day);
  const gregStr = gregorian.toISOString().split('T')[0];
  const weekday = gregorian.getDay();
  console.log(`   ${test.desc} → ${gregStr} (${weekdays[weekday]})`);
});

console.log('\n=== Test Complete ===');