import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/routers';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import LandingScreen from '../screens/LandingScreen';

const Stack = createNativeStackNavigator();

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Landing: undefined;
};

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Landing" component={LandingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
