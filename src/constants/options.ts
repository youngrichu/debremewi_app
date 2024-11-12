export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export const UAE_CITIES: DropdownOption[] = [
  { label: 'Select City', value: '', disabled: true },
  { label: 'Dubai', value: 'dubai' },
  { label: 'Abu Dhabi', value: 'abu_dhabi' },
  { label: 'Sharjah', value: 'sharjah' },
  { label: 'Ajman', value: 'ajman' },
  { label: 'Ras Al Khaimah', value: 'ras_al_khaimah' },
  { label: 'Fujairah', value: 'fujairah' },
  { label: 'Umm Al Quwain', value: 'umm_al_quwain' },
  { label: 'Al Ain', value: 'al_ain' }
];

export const EDUCATION_LEVEL_OPTIONS: DropdownOption[] = [
  { label: 'Select Education Level', value: '', disabled: true },
  { label: 'Student', value: 'student' },
  { label: 'Completed Grade 10', value: 'grade_10' },
  { label: 'Completed Grade 12', value: 'grade_12' },
  { label: 'Diploma', value: 'diploma' },
  { label: 'Degree', value: 'degree' },
  { label: "Master's", value: 'masters' },
  { label: 'Doctorate', value: 'doctorate' }
];

export const MARITAL_STATUS_OPTIONS: DropdownOption[] = [
  { label: 'Select Marital Status', value: '', disabled: true },
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Divorced', value: 'divorced' },
  { label: 'Widowed', value: 'widowed' }
];

export const SERVICE_AT_PARISH_OPTIONS: DropdownOption[] = [
  { label: 'Select a Service Type', value: '', disabled: true },
  { label: 'Accounting and Budget', value: 'accounting' },
  { label: 'Finance', value: 'finance' },
  { label: 'Treasurer', value: 'treasurer' },
  { label: 'Education and Training', value: 'education' },
  { label: 'Public Relation', value: 'public_relation' },
  { label: 'Development', value: 'development' },
  { label: 'Construction and Renovation', value: 'construction' },
  { label: 'Law and Order/Discipline', value: 'law_order' },
  { label: 'Charity/Philanthropy', value: 'charity' },
  { label: 'Religious Education', value: 'religious_education' },
  { label: 'Property Management', value: 'property' },
  { label: 'Parish Council Coordination', value: 'council' },
  { label: 'Offering Collector', value: 'offering' },
  { label: 'Statistician', value: 'statistician' },
  { label: 'Media and IT', value: 'media_and_it' }
];

export const MINISTRY_SERVICE_OPTIONS: DropdownOption[] = [
  { label: 'Select Sub-department Service', value: '', disabled: true },
  { label: 'Accounting and Budget', value: 'accounting' },
  { label: 'Finance', value: 'finance' },
  { label: 'Treasurer', value: 'treasurer' },
  { label: 'Education and Training', value: 'education' },
  { label: 'Public Relation', value: 'public_relation' },
  { label: 'Development', value: 'development' },
  { label: 'Construction and Renovation', value: 'construction' },
  { label: 'Law and Order/Discipline', value: 'law_order' },
  { label: 'Charity/Philanthropy', value: 'charity' },
  { label: 'Religious Education', value: 'religious_education' },
  { label: 'Property Management', value: 'property' },
  { label: 'Parish Council Coordination', value: 'council' },
  { label: 'Offering Collector', value: 'offering' },
  { label: 'Statistician', value: 'statistician' },
  { label: 'Media', value: 'media' },
  { label: 'IT', value: 'it' }
];

export const CHRISTIAN_LIFE_OPTIONS: DropdownOption[] = [
  { label: 'Select Christian Life Status', value: '', disabled: true },
  { label: 'Not Repented', value: 'not_repent' },
  { label: 'Repented', value: 'repent' },
  { label: 'Takes Holy Communion', value: 'communion' }
];

export const GENDER_OPTIONS: DropdownOption[] = [
  { label: 'Select Gender', value: '', disabled: true },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' }
];

export const YES_NO_OPTIONS: DropdownOption[] = [
  { label: 'Select Option', value: '', disabled: true },
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' }
];

export const SERVICE_DISPLAY_MAP: { [key: string]: string } = {
  'media': 'Media',
  'IT': 'IT',
  'accounting': 'Accounting and Budget',
  'finance': 'Finance',
  'treasurer': 'Treasurer',
  'education': 'Education and Training',
  'public_relation': 'Public Relations',
  'development': 'Development',
  'construction': 'Construction and Renovation',
  'law_order': 'Law and Order/Discipline',
  'charity': 'Charity/Philanthropy',
  'religious_education': 'Religious Education',
  'property': 'Property Management',
  'council': 'Parish Council Coordination',
  'offering': 'Offering Collector',
  'statistician': 'Statistician'
};