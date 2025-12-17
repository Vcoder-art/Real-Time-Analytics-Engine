import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSettings, updateSettings } from "../services/settingService";

const initialState = {
  loading: false,
  saving: false,
  settings: null,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  "settings/fetch",
  async (_, thunkAPI) => {
    try {
      return await getSettings();
    } catch (err) {
      thunkAPI.rejectWithValue(
        err.response.data.msg || "Failed to load settings."
      );
    }
  }
);

export const updateSett = createAsyncThunk(
  "settings/update",
  async (updates, thunkAPI) => {
    try {
      return await updateSettings(updates);
    } catch (err) {
      thunkAPI.rejectWithValue(
        err.response.data.msg || "Failed to update settings"
      );
    }
  }
);

const settingSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSett.pending,(state)=>{
        state.saving = true;   
      })
      .addCase(updateSett.fulfilled,(state,action) => {
        state.saving = false;
        state.settings = action.payload;
      })
      .addCase(updateSett.rejected,(state,action) => {
        state.saving = false;
        state.error = action.payload;  
      })
  },
});


export default settingSlice.reducer;