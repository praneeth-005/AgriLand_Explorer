import { createSlice } from '@reduxjs/toolkit';

const loadInitialUser = () => {
  try {
    const saved = localStorage.getItem('agri_auth_user');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
};

const initialState = {
  user: loadInitialUser(),
  session: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.loading = false;
      try {
        if (action.payload.user) {
          localStorage.setItem('agri_auth_user', JSON.stringify(action.payload.user));
        }
      } catch (e) {}
    },
    clearAuth: (state) => {
      // Don't auto-clear admin session on Supabase auth change listeners
      if (state.user?.user_metadata?.role === 'admin') return;
      state.user = null;
      state.session = null;
      state.loading = false;
      try {
        localStorage.removeItem('agri_auth_user');
      } catch (e) {}
    },
    forceLogout: (state) => {
      state.user = null;
      state.session = null;
      state.loading = false;
      try {
        localStorage.removeItem('agri_auth_user');
      } catch (e) {}
    }
  }
});

export const { setAuth, clearAuth, forceLogout } = authSlice.actions;
export default authSlice.reducer;
