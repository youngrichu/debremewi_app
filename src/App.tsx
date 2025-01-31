import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './store';
import Navigation from './navigation';
import { initializeApiClient } from './api/client';
import { initializeI18n } from './i18n';
import { StatusBar } from 'react-native';
import { AuthProvider } from './contexts/AuthContext';

const App = () => {
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeI18n();
        await initializeApiClient();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initialize();
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <Navigation />
        </NavigationContainer>
      </AuthProvider>
    </Provider>
  );
};

export default App;
