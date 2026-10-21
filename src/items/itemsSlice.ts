// src/features/items/itemsSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { ShopItem } from "../types";

const API = "http://localhost:3001/items";

export const fetchItems = createAsyncThunk("items/fetch", async (userId: number) => {
  const res = await fetch(`${API}?userId=${userId}`);
  return (await res.json()) as ShopItem[];
});

export const addItem = createAsyncThunk("items/add", async (item: Omit<ShopItem, "id">) => {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return (await res.json()) as ShopItem;
});

export const toggleItem = createAsyncThunk("items/toggle", async (item: ShopItem) => {
  const res = await fetch(`${API}/${item.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bought: !item.bought }),
  });
  return (await res.json()) as ShopItem;
});

export const deleteItem = createAsyncThunk("items/delete", async (id: number) => {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  return id;
});

interface ItemsState {
  list: ShopItem[];
  status: "idle" | "loading" | "failed";
}

const initialState: ItemsState = { list: [], status: "idle" };

const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (s) => { s.status = "loading"; })
      .addCase(fetchItems.fulfilled, (s, a: PayloadAction<ShopItem[]>) => {
        s.status = "idle";
        s.list = a.payload;
      })
      .addCase(fetchItems.rejected, (s) => { s.status = "failed"; })
      .addCase(addItem.fulfilled, (s, a) => { s.list.push(a.payload); })
      .addCase(toggleItem.fulfilled, (s, a) => {
        const i = s.list.findIndex((x) => x.id === a.payload.id);
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(deleteItem.fulfilled, (s, a) => {
        s.list = s.list.filter((x) => x.id !== a.payload);
      });
  },
});

export default itemsSlice.reducer;