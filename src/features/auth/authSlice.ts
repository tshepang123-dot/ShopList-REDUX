import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "../../types";

const API = "http://localhost:3001/users";


export const loginUser = createAsyncThunk<
  User, 
  { email: string; password: string }, 
  { rejectValue: string } 
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  const res = await fetch(`${API}?email=${encodeURIComponent(email)}`);
  const users: User[] = await res.json();

  if (users.length === 0 || users[0].password !== password) {
    return rejectWithValue("Invalid email or password.");
  }
  return users[0];
});


interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
}


const saved = localStorage.getItem("user");

const initialState: AuthState = {
  user: saved ? JSON.parse(saved) : null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

 
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem("user");
    },
    clearError(state) {
      state.error = null;
    },
  },

  
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Something went wrong.";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;