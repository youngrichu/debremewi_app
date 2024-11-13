import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

export const Text: React.FC<TextProps> = (props) => {
  return <RNText {...props} />;
}; 