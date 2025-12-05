import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';

import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import notificationsReducer from './slices/notificationsSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user'] // Only persist auth and user reducers
};

const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  notifications: notificationsReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'RESET_APP_STATE') {
    // Clear all storage when resetting app state
    AsyncStorage.removeItem('persist:root');
    state = undefined;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


