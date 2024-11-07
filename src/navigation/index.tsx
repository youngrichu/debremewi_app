import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import EventsScreen from '../screens/EventsScreen';
import LandingScreen from '../screens/LandingScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Events: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Events" component={EventsScreen} options={{ headerShown: true, title: 'Events' }} />
        <Stack.Screen name="Register" component={AuthScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
