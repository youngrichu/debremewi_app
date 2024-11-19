import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store, persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import AppNavigator from './navigation/AppNavigator';
import { ToastProvider } from 'react-native-toast-notifications';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setAuthState } from './store/slices/authSlice';
import { registerForPushNotificationsAsync, addNotificationListener, addNotificationResponseListener } from './services/pushNotifications';
import { navigationRef } from './navigation/navigationRef';
import { fetchNotifications } from './store/slices/notificationsSlice';

const LoadingComponent = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#2196F3" />
  </View>
);

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          dispatch(setAuthState({ 
            isAuthenticated: true, 
            token 
          }));
        }
      } catch (error) {
        console.error('Error checking token:', error);
      }
    };

    const initializePushNotifications = async () => {
      console.log('Initializing push notifications...');
      const token = await registerForPushNotificationsAsync();
      console.log('Got token:', token);
      
      // Add notification listeners
      const notificationListener = addNotificationListener(notification => {
        console.log('Received notification:', notification);
        dispatch(fetchNotifications());
      });

      // Add notification response listener for handling clicks
      const responseListener = addNotificationResponseListener();

      // Cleanup function
      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    };

    checkToken();
    initializePushNotifications();
  }, [dispatch]);

  return <AppNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingComponent />} persistor={persistor}>
        <NavigationContainer ref={navigationRef}>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
