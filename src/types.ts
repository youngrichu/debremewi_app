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
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  'About Us': undefined;
  Services: undefined;
  'Contact Us': undefined;
  Location: undefined;
}; 