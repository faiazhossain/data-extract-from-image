import { configureStore } from "@reduxjs/toolkit";
import markerReducer from "./features/markerSlice";

export const store = configureStore({
  reducer: {
    marker: markerReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
