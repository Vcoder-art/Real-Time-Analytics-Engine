import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/authService";

//intial State
const user = JSON.parse(localStorage.getItem("analytics_user"));

const initialState = {
  user: user ? user : null,
  loading: false,
  error: null,
  setting: false,
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login Failed"
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    openSettings: (state) => {
      state.setting = true;
    },
    closeSettings: (state) => {
      state.setting = false;
    },
    toggleSettings: (state) => {
      state.setting = !state.setting;
    },
    logout: (state) => {
      state.user = null;
      state.setting = false;
      localStorage.removeItem("analytics_user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
      })
  },
});

export const { closeSettings, openSettings, toggleSettings , logout } =
  authSlice.actions;

export default authSlice.reducer;
