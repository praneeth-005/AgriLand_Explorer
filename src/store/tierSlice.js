import { createSlice } from '@reduxjs/toolkit';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const loadInitialState = () => {
  const today = getTodayDateString();
  const saved = localStorage.getItem('agri_freemium_tier_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Auto-restock if date changed
      if (parsed.lastRestockDate !== today) {
        return {
          ...parsed,
          chatbotQueriesUsedToday: 0,
          soilCalcsUsedToday: 0,
          weatherChecksToday: 0,
          lastRestockDate: today,
          lastRestockTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          justRestocked: true
        };
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse tier state from storage", e);
    }
  }

  return {
    tier: 'free', // 'free' | 'pro'
    maxFieldBoundaries: 2,
    maxChatQueriesPerDay: 10,
    chatbotQueriesUsedToday: 0,
    soilCalcsUsedToday: 0,
    weatherChecksToday: 0,
    lastRestockDate: today,
    lastRestockTime: '12:00 AM',
    justRestocked: false
  };
};

const saveState = (state) => {
  try {
    localStorage.setItem('agri_freemium_tier_state', JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save tier state", e);
  }
};

const initialState = loadInitialState();

const tierSlice = createSlice({
  name: 'tier',
  initialState,
  reducers: {
    checkAndRestockDaily: (state) => {
      const today = getTodayDateString();
      if (state.lastRestockDate !== today) {
        state.chatbotQueriesUsedToday = 0;
        state.soilCalcsUsedToday = 0;
        state.weatherChecksToday = 0;
        state.lastRestockDate = today;
        state.lastRestockTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        state.justRestocked = true;
        saveState(state);
      }
    },
    useChatbotQuery: (state) => {
      if (state.tier === 'free' && state.chatbotQueriesUsedToday < state.maxChatQueriesPerDay) {
        state.chatbotQueriesUsedToday += 1;
        saveState(state);
      }
    },
    trackSoilCalcUse: (state) => {
      state.soilCalcsUsedToday += 1;
      saveState(state);
    },
    trackWeatherCheck: (state) => {
      state.weatherChecksToday += 1;
      saveState(state);
    },
    forceRestock: (state) => {
      const today = getTodayDateString();
      state.chatbotQueriesUsedToday = 0;
      state.soilCalcsUsedToday = 0;
      state.weatherChecksToday = 0;
      state.lastRestockDate = today;
      state.lastRestockTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      state.justRestocked = true;
      saveState(state);
    },
    clearRestockNotice: (state) => {
      state.justRestocked = false;
      saveState(state);
    },
    setTier: (state, action) => {
      state.tier = action.payload; // 'free' or 'pro'
      saveState(state);
    }
  }
});

export const {
  checkAndRestockDaily,
  useChatbotQuery,
  trackSoilCalcUse,
  trackWeatherCheck,
  forceRestock,
  clearRestockNotice,
  setTier
} = tierSlice.actions;

export default tierSlice.reducer;
