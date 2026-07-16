import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  session: null,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.loading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.loading = false;
    }
  }
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
