import { LogBox } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './store';
import AppNavigator from './navigation/AppNavigator';
import { navigationRef } from './navigation/navigationRef';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Support for defaultProps will be removed',
  'Warning: TRenderEngineProvider:',
  'Warning: MemoizedTNodeRenderer:',
  'Warning: TNodeChildrenRenderer:'
]);

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
} 