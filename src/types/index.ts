export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

export interface ShopItem {
  id: number;
  userId: number;
  name: string;
  quantity: number;
  bought: boolean;
}