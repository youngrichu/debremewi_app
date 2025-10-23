// Simple test for the new Ethiopian calendar conversion algorithm

// Copy the core functions from the TypeScript file
const constants = {
  _ethiopicEpoch: 2796,
  _unixEpoch: 719163,
  dayMilliSec: 86400000,
};

function isEthiopianLeap(year) {
  return year % 4 === 3;
}

function fixedFromEthiopic(year, month, day) {
  return constants._ethiopicEpoch - 1 + 365 * (year - 1) + Math.floor(year / 4) + 30 * (month - 1) + day;
}

function ethiopicFromFixed(fixed) {
  const year = Math.floor((4 * (fixed - constants._ethiopicEpoch) + 1463) / 1461);
  const month = Math.floor((fixed - fixedFromEthiopic(year, 1, 1)) / 30) + 1;
  const day = fixed + 1 - fixedFromEthiopic(year, month, 1);
  return { year, month, day };
}

function fixedFromGregorian(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year - a;
  const m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function gregorianFromFixed(fixed) {
  const a = fixed + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  
  return { year, month, day };
}

function toEthiopian(date) {
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1;
  const gregorianDay = date.getDate();
  
  const fixed = fixedFromGregorian(gregorianYear, gregorianMonth, gregorianDay);
  return ethiopicFromFixed(fixed);
}

function ethiopianToGregorian(year, month, day) {
  const fixed = fixedFromEthiopic(year, month, day);
  const gregorian = gregorianFromFixed(fixed);
  
  return new Date(gregorian.year, gregorian.month - 1, gregorian.day);
}

console.log('Testing new AbushakirJs-based Ethiopian calendar algorithm...\n');

// Test specific dates that were problematic before
const testDates = [
  { greg: new Date(2025, 9, 23), desc: 'October 23, 2025 (Thursday)' },
  { greg: new Date(2025, 8, 11), desc: 'September 11, 2025 (Meskerem 1)' },
  { greg: new Date(2025, 8, 12), desc: 'September 12, 2025' },
  { greg: new Date(2025, 9, 11), desc: 'October 11, 2025' },
  { greg: new Date(2025, 9, 20), desc: 'October 20, 2025' },
];

console.log('=== Gregorian to Ethiopian Conversion Tests ===');
testDates.forEach(({ greg, desc }) => {
  try {
    const eth = toEthiopian(greg);
    const weekday = greg.toLocaleDateString('en-US', { weekday: 'long' });
    console.log(`${desc} (${weekday}) -> Ethiopian: ${eth.year}/${eth.month}/${eth.day}`);
  } catch (error) {
    console.log(`${desc} -> ERROR: ${error.message}`);
  }
});

console.log('\n=== Ethiopian to Gregorian Conversion Tests ===');
const ethiopianTestDates = [
  { year: 2018, month: 1, day: 1, desc: 'Meskerem 1, 2018' },
  { year: 2018, month: 2, day: 1, desc: 'Tikimt 1, 2018' },
  { year: 2018, month: 2, day: 13, desc: 'Tikimt 13, 2018' },
  { year: 2018, month: 13, day: 1, desc: 'Pagume 1, 2018' },
];

ethiopianTestDates.forEach(({ year, month, day, desc }) => {
  try {
    const greg = ethiopianToGregorian(year, month, day);
    const weekday = greg.toLocaleDateString('en-US', { weekday: 'long' });
    console.log(`${desc} -> Gregorian: ${greg.getFullYear()}/${greg.getMonth() + 1}/${greg.getDate()} (${weekday})`);
  } catch (error) {
    console.log(`${desc} -> ERROR: ${error.message}`);
  }
});

console.log('\n=== Round-trip Conversion Tests ===');
testDates.forEach(({ greg, desc }) => {
  try {
    const eth = toEthiopian(greg);
    const backToGreg = ethiopianToGregorian(eth.year, eth.month, eth.day);
    const match = greg.getTime() === backToGreg.getTime();
    console.log(`${desc} -> Ethiopian: ${eth.year}/${eth.month}/${eth.day} -> Back to Gregorian: ${match ? 'MATCH' : 'MISMATCH'}`);
    if (!match) {
      console.log(`  Original: ${greg.toISOString().split('T')[0]}`);
      console.log(`  Converted back: ${backToGreg.toISOString().split('T')[0]}`);
    }
  } catch (error) {
    console.log(`${desc} -> ERROR: ${error.message}`);
  }
});

console.log('\n=== Ethiopian Leap Year Tests ===');
const leapYearTests = [2015, 2016, 2017, 2018, 2019, 2020];
leapYearTests.forEach(year => {
  const isLeap = isEthiopianLeap(year);
  console.log(`Ethiopian year ${year}: ${isLeap ? 'LEAP' : 'NOT LEAP'} (year % 4 = ${year % 4})`);
});