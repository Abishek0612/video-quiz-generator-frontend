import { apiClient } from "./client";
import { AuthResponse } from "@/types";

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  },

  register: async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> => {
    const { data } = await apiClient.post("/auth/register", payload);
    return data;
  },
};
