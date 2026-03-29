import api from "./axios";
import type {
  AdminUpdateUserRoleRequest,
  AdminUserItem,
  CurrentUser,
} from "../types/user";

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await api.get<CurrentUser>("/users/me");
  return response.data;
}

export async function getAdminUsers(): Promise<AdminUserItem[]> {
  const response = await api.get<AdminUserItem[]>("/users/admin");
  return response.data;
}

export async function updateAdminUserRole(
  id: string,
  request: AdminUpdateUserRoleRequest
): Promise<AdminUserItem> {
  const response = await api.put<AdminUserItem>(`/users/admin/${id}/role`, request);
  return response.data;
}