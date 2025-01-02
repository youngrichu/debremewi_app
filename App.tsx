import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { store } from './src/store';
import { i18nInit } from './src/i18n';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    i18nInit
      .then(() => setIsI18nInitialized(true))
      .catch(error => console.error('Failed to initialize i18n:', error));
  }, []);

  if (!isI18nInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            translucent={true}
          />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </Provider>
  );
}
