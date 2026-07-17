import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../supabaseClient.js';

// Helper to format DB row to Frontend expected camelCase format
const formatLand = (dbLand) => ({
  id: dbLand.id,
  name: dbLand.name,
  area: dbLand.area,
  surveyNumber: dbLand.survey_number,
  polygonPoints: dbLand.polygon_points,
  tags: dbLand.tags || [],
  status: dbLand.status,
  image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=800&auto=format&fit=crop'
});

export const fetchLands = createAsyncThunk('lands/fetchLands', async (_, { getState }) => {
  const user = getState().auth.user;
  if (!user) return [];
  const { data, error } = await supabase.from('lands').select('*').eq('user_id', user.id);
  if (error) throw error;
  return data.map(formatLand);
});

export const addLand = createAsyncThunk('lands/addLand', async (landData, { getState }) => {
  const user = getState().auth.user;
  if (!user) throw new Error("User must be logged in to save land");

  const newLand = {
    user_id: user.id,
    name: landData.ownerName ? landData.ownerName + "'s Farm" : 'My Farm',
    area: landData.area,
    survey_number: landData.unknownSurvey ? `TEMP-${Math.floor(Math.random() * 10000)}` : landData.surveyNumber,
    polygon_points: landData.polygonPoints,
    tags: [{ label: 'Awaiting Analysis', color: 'yellow' }],
    status: 'Newly Added'
  };

  const { data, error } = await supabase.from('lands').insert([newLand]).select();
  if (error) throw error;
  return formatLand(data[0]);
});

export const updateLand = createAsyncThunk('lands/updateLand', async (updatePayload) => {
  const { id, polygonPoints, ...otherData } = updatePayload;
  
  const updates = {};
  if (polygonPoints) updates.polygon_points = polygonPoints;
  // Add other mapped updates if needed

  const { data, error } = await supabase.from('lands').update(updates).eq('id', id).select();
  if (error) throw error;
  return formatLand(data[0]);
});

export const removeLand = createAsyncThunk('lands/removeLand', async (id) => {
  const { error } = await supabase.from('lands').delete().eq('id', id);
  if (error) throw error;
  return id;
});

const landsSlice = createSlice({
  name: 'lands',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLands.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLands.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addLand.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateLand.fulfilled, (state, action) => {
        const index = state.items.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(removeLand.fulfilled, (state, action) => {
        state.items = state.items.filter(l => l.id !== action.payload);
      });
  }
});

export default landsSlice.reducer;
