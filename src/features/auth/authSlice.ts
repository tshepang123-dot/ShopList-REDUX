import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "../../types";

const API = "http://localhost:3001/users";

// LOGIN: asks json-server for a user with this email,
// then checks that the password matches
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

// REGISTER: checks the email is free, then creates the user
export const registerUser = createAsyncThunk<
  User,
  { name: string; email: string; password: string },
  { rejectValue: string }
>("auth/register", async ({ name, email, password }, { rejectWithValue }) => {
  // 1. Check whether the email is already taken
  const check = await fetch(`${API}?email=${encodeURIComponent(email)}`);
  const existing: User[] = await check.json();

  if (existing.length > 0) {
    return rejectWithValue("An account with this email already exists.");
  }

  // 2. Create the user
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return (await res.json()) as User;
});

// STATE SHAPE
interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

// Restore the logged-in user after a page refresh
const saved = localStorage.getItem("user");

const initialState: AuthState = {
  user: saved ? JSON.parse(saved) : null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  // REDUCERS: instant, synchronous changes
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem("user");
    },
    clearError(state) {
      state.error = null;
    },
  },

  // EXTRA REDUCERS: react to the thunks' three stages
  extraReducers: (builder) => {
    builder
      // LOGIN
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
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Something went wrong.";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;