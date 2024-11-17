import React from 'react';
import { View, ActivityIndicator } from 'react-native';

interface Props {
  children: React.ReactNode;
}

const AuthProvider: React.FC<Props> = ({ children }) => {
  return <>{children}</>;
};

export default AuthProvider; 