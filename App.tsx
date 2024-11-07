import React from 'react';
import { Provider } from 'react-redux';
import AuthScreen from './src/screens/AuthScreen';
import { store } from './src/store'; // Adjust the path if your store is located elsewhere

export default function App() {
  return (
    <Provider store={store}>
      <AuthScreen />
    </Provider>
  );
}
