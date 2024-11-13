export const GENDER_OPTIONS = ['male', 'female'];

export const MARITAL_STATUS_OPTIONS = ['single', 'married', 'divorced', 'widowed'];

export const EDUCATION_LEVEL_OPTIONS = [
  'student',
  'grade_10',
  'grade_12',
  'diploma',
  'degree',
  'masters',
  'doctorate'
];

export const CHRISTIAN_LIFE_OPTIONS = [
  'not_repent',
  'repent',
  'communion'
];

export const SERVICE_AT_PARISH_OPTIONS = [
  'priesthood',
  'deacon',
  'choir',
  'sunday_school',
  'council',
  'chalice_association',
  'parents',
  'childrens_department',
  'none'
];

export const MINISTRY_SERVICE_OPTIONS = [
  'gospel',
  'accounting',
  'finance',
  'treasurer',
  'education',
  'public_relation',
  'development',
  'construction',
  'law_order',
  'charity',
  'religious_education',
  'property',
  'council',
  'offering',
  'statistician',
  'media',
  'it'
];

export const UAE_CITIES = [
  'dubai',
  'abu_dhabi',
  'sharjah',
  'ajman',
  'ras_al_khaimah',
  'fujairah',
  'umm_al_quwain',
  'al_ain'
];

export const YES_NO_OPTIONS = ['yes', 'no'];

// Map picker names to their options and translation namespace
export const PICKER_CONFIG = {
  gender: {
    options: GENDER_OPTIONS,
    namespace: 'profile'
  },
  maritalStatus: {
    options: MARITAL_STATUS_OPTIONS,
    namespace: 'profile'
  },
  educationLevel: {
    options: EDUCATION_LEVEL_OPTIONS,
    namespace: 'profile'
  },
  christianLife: {
    options: CHRISTIAN_LIFE_OPTIONS,
    namespace: 'profile'
  },
  serviceAtParish: {
    options: SERVICE_AT_PARISH_OPTIONS,
    namespace: 'profile'
  },
  ministryService: {
    options: MINISTRY_SERVICE_OPTIONS,
    namespace: 'profile'
  },
  residencyCity: {
    options: UAE_CITIES,
    namespace: 'profile'
  },
  hasFatherConfessor: {
    options: YES_NO_OPTIONS,
    namespace: 'common'
  },
  residencePermit: {
    options: YES_NO_OPTIONS,
    namespace: 'common'
  },
  hasChildren: {
    options: YES_NO_OPTIONS,
    namespace: 'common'
  },
  hasAssociationMembership: {
    options: YES_NO_OPTIONS,
    namespace: 'common'
  }
} as const;

// Helper function to get picker options and namespace
export const getPickerConfig = (pickerName: keyof typeof PICKER_CONFIG) => {
  return PICKER_CONFIG[pickerName] || { options: [], namespace: 'profile' };
};