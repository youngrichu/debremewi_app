export const validatePhone = (phone: string): boolean => {
  // Just check if it has at least 10 digits
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10;
};

export const validateName = (name: string): boolean => {
  // Just check if it's not empty and has minimum length
  return name.trim().length >= 2;
};

export const validateCity = (city: string): boolean => {
  // Just check if it's not empty
  return city.trim().length > 0;
};

export const validateChristianName = (name: string | undefined): boolean => {
  // Optional field - if provided, just check minimum length
  if (!name || name.trim() === '') return true;
  return name.trim().length >= 2;
};

export const getValidationError = (field: string, value: string): string | null => {
  switch (field) {
    case 'phoneNumber':
      if (!value) return 'Phone number is required';
      return validatePhone(value) ? null : 'Please enter a valid phone number (min 10 digits)';
      
    case 'firstName':
      if (!value) return 'First name is required';
      return validateName(value) ? null : 'First name must be at least 2 characters';
      
    case 'lastName':
      if (!value) return 'Last name is required';
      return validateName(value) ? null : 'Last name must be at least 2 characters';
      
    case 'residencyCity':
      if (!value) return 'City is required';
      return validateCity(value) ? null : 'Please enter a city name';
      
    case 'christianName':
      return validateChristianName(value) ? null : 'Christian name must be at least 2 characters';
      
    default:
      return null;
  }
};

import { ChildInfo } from '../types';

export const validateChildrenData = (
  hasChildren: string,
  numberOfChildren: string | undefined,
  children: ChildInfo[] | undefined
): { isValid: boolean; errorKey?: string } => {
  if (hasChildren === 'yes') {
    if (!children || !Array.isArray(children)) {
      return { isValid: false, errorKey: 'validation.children.invalidArray' };
    }

    if (!numberOfChildren || children.length !== parseInt(numberOfChildren)) {
      return { 
        isValid: false, 
        errorKey: 'validation.children.numberMismatch' 
      };
    }

    const invalidChild = children.find(child => 
      !child.fullName || 
      !child.christianityName || 
      !child.gender
    );

    if (invalidChild) {
      return { 
        isValid: false, 
        errorKey: 'validation.children.missingFields' 
      };
    }
  }

  return { isValid: true };
}; 