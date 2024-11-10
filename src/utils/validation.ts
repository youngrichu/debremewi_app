export const validatePhone = (phone: string): boolean => {
  // Phone validation - allows international format with + and spaces
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateName = (name: string): boolean => {
  // Name validation - at least 2 characters, letters, spaces, and hyphens only
  const nameRegex = /^[a-zA-Z\s-]{2,}$/;
  return nameRegex.test(name.trim());
};

export const validateCity = (city: string): boolean => {
  // City validation - at least 2 characters, letters, spaces, and commas only
  const cityRegex = /^[a-zA-Z\s,]{2,}$/;
  return cityRegex.test(city.trim());
};

export const validateChristianName = (name: string | undefined): boolean => {
  // Optional field - if provided, must be at least 2 characters
  if (!name || name.trim() === '') return true;
  const nameRegex = /^[a-zA-Z\s-]{2,}$/;
  return nameRegex.test(name.trim());
};

export const getValidationError = (field: string, value: string): string | null => {
  switch (field) {
    case 'phoneNumber':
      if (!value) return 'Phone number is required';
      return validatePhone(value) ? null : 'Please enter a valid phone number (min 10 digits)';
      
    case 'firstName':
      if (!value) return 'First name is required';
      return validateName(value) ? null : 'First name must contain only letters and be at least 2 characters';
      
    case 'lastName':
      if (!value) return 'Last name is required';
      return validateName(value) ? null : 'Last name must contain only letters and be at least 2 characters';
      
    case 'residencyCity':
      if (!value) return 'City is required';
      return validateCity(value) ? null : 'Please enter a valid city name';
      
    case 'christianName':
      return validateChristianName(value) ? null : 'Christian name must contain only letters and be at least 2 characters';
      
    default:
      return null;
  }
}; 