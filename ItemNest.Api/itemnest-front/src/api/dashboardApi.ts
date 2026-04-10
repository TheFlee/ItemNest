import api from "./axios";
import type { AdminDashboard, MyDashboard } from "../types/dashboard";

export async function getMyDashboard(): Promise<MyDashboard> {
  const response = await api.get<MyDashboard>("/dashboard/me");
  return response.data;
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await api.get<AdminDashboard>("/dashboard/admin");
  return response.data;
}