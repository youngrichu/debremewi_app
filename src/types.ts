export type RootStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  HomeStack: {
    screen: string;
    params?: object;
  };
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
  More: {
    screen: string;
    params?: object;
  };
  NewPassword: { email: string };
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  'About Us': undefined;
  Services: undefined;
  'Contact Us': undefined;
  Location: undefined;
};

// Authentication Types
interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  submit?: string;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginFormData {
  email: string;
  password: string;
} 