import api from "./axios";
import type { MyDashboard } from "../types/dashboard";

export async function getMyDashboard(): Promise<MyDashboard> {
  const response = await api.get<MyDashboard>("/dashboard/me");
  return response.data;
}