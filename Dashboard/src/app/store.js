import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/slices/authSlice";
import settingsReducer from "../features/slices/settingSlice"

export const store = configureStore({
  reducer : {
    auth: authReducer,
    settings: settingsReducer
  }
});

