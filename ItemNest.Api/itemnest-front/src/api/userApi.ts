import api from "./axios";
import type { AuthResponse } from "../types/auth";
import type {
  AdminUpdateUserBlockStatusRequest,
  AdminUpdateUserRoleRequest,
  AdminUserItem,
  ChangeMyPasswordRequest,
  CurrentUser,
  UpdateMyEmailRequest,
} from "../types/user";

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await api.get<CurrentUser>("/users/me");
  return response.data;
}

export async function updateMyEmail(request: UpdateMyEmailRequest): Promise<AuthResponse> {
  const response = await api.put<AuthResponse>("/users/me/email", request);
  return response.data;
}

export async function changeMyPassword(request: ChangeMyPasswordRequest): Promise<void> {
  await api.put("/users/me/password", request);
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

export async function updateAdminUserBlockStatus(
  id: string,
  request: AdminUpdateUserBlockStatusRequest
): Promise<AdminUserItem> {
  const response = await api.put<AdminUserItem>(
    `/users/admin/${id}/block-status`,
    request
  );
  return response.data;
}