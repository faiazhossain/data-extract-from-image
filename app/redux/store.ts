import { configureStore } from '@reduxjs/toolkit';
import poiReducer from './features/poiSlice';

export const store = configureStore({
  reducer: {
    poi: poiReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
