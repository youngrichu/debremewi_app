// Debug script to understand the year calculation issue
const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Let's understand the Ethiopian calendar year system
console.log('=== Understanding Ethiopian Year System ===');
console.log('Ethiopian calendar is about 7-8 years behind Gregorian');
console.log('Current Gregorian year 2025 should correspond to Ethiopian year around 2017-2018');
console.log('');

// From the screenshot, we see:
// - Gregorian: October 2025 
// - Ethiopian: Tikimt 2018
// So Ethiopian year 2018 should map to Gregorian year 2025

console.log('=== Testing Year Calculation Logic ===');

// Current logic: month >= 5 ? year + 7 : year + 8
// For Tikimt (month 2): 2018 + 8 = 2026 (WRONG - should be 2025)
// For months 1-4: year + 8
// For months 5-13: year + 7

console.log('Current logic test:');
console.log('Tikimt (month 2): 2018 + 8 = 2026');
console.log('But we want: 2018 -> 2025');
console.log('');

// Let's figure out the correct logic
// Ethiopian New Year (Meskerem 1) typically falls around September 11
// So Ethiopian months 1-4 (Meskerem to Tahsas) overlap with Gregorian year Y
// Ethiopian months 5-13 (Tir to Pagume) overlap with Gregorian year Y+1

// But wait, let's check the mapping more carefully
const GREGORIAN_TO_ETHIOPIAN = [
  { from: [9, 11], to: [1, 1] },    // Meskerem - September
  { from: [10, 11], to: [2, 1] },   // Tikimt - October  
  { from: [11, 10], to: [3, 1] },   // Hidar - November
  { from: [12, 10], to: [4, 1] },   // Tahsas - December
  { from: [1, 9], to: [5, 1] },     // Tir - January (next year)
  { from: [2, 8], to: [6, 1] },     // Yekatit - February
  { from: [3, 10], to: [7, 1] },    // Megabit - March
  { from: [4, 9], to: [8, 1] },     // Miyazia - April
  { from: [5, 9], to: [9, 1] },     // Ginbot - May
  { from: [6, 8], to: [10, 1] },    // Sene - June
  { from: [7, 8], to: [11, 1] },    // Hamle - July
  { from: [8, 7], to: [12, 1] },    // Nehase - August
  { from: [9, 6], to: [13, 1] },    // Pagume - September (early)
];

console.log('=== Analyzing the mapping ===');
console.log('Ethiopian months 1-4 map to Gregorian months 9-12 (Sep-Dec)');
console.log('Ethiopian months 5-13 map to Gregorian months 1-9 (Jan-Sep of NEXT year)');
console.log('');

// So if we're in Ethiopian year 2018:
// - Months 1-4 (Meskerem-Tahsas) should be in Gregorian 2025
// - Months 5-13 (Tir-Pagume) should be in Gregorian 2026

// But the screenshot shows Tikimt 2018 = October 2025
// Tikimt is month 2, so it should be 2025, not 2026

console.log('=== Correct Logic Should Be ===');
console.log('For Ethiopian months 1-4: gregorianYear = ethiopianYear + 7');
console.log('For Ethiopian months 5-13: gregorianYear = ethiopianYear + 8');
console.log('');

console.log('Testing with Tikimt (month 2) 2018:');
console.log('Should be: 2018 + 7 = 2025 ✓');
console.log('');

// Let's test this logic
function testYearCalculation(ethYear, ethMonth) {
  const gregorianYear = ethMonth <= 4 ? ethYear + 7 : ethYear + 8;
  console.log(`Ethiopian ${ethYear}-${ethMonth} -> Gregorian year ${gregorianYear}`);
  return gregorianYear;
}

console.log('=== Testing New Logic ===');
testYearCalculation(2018, 1); // Meskerem -> 2025
testYearCalculation(2018, 2); // Tikimt -> 2025 ✓
testYearCalculation(2018, 3); // Hidar -> 2025
testYearCalculation(2018, 4); // Tahsas -> 2025
testYearCalculation(2018, 5); // Tir -> 2026
testYearCalculation(2018, 6); // Yekatit -> 2026