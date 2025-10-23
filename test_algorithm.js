const { toEthiopian, ethiopianToGregorian, isEthiopianLeap } = require('./src/utils/ethiopianCalendar.ts');

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