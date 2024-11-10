import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import AppNavigator from './navigation/AppNavigator';
import { checkAuth } from './store/authSlice';
import { LogBox } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Support for defaultProps will be removed',
  'TRenderEngineProvider:',
  'MemoizedTNodeRenderer:',
  'TNodeChildrenRenderer:'
]);

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return <AppNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </Provider>
  );
} 