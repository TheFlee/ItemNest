import api from "./axios";
import type { ItemPost } from "../types/post";

export interface AdminUpdatePostStatusRequest {
  status: number;
}

export async function getAdminPosts(): Promise<ItemPost[]> {
  const response = await api.get<ItemPost[]>("/admin/posts");
  return response.data;
}

export async function updateAdminPostStatus(
  id: string,
  request: AdminUpdatePostStatusRequest
): Promise<ItemPost> {
  const response = await api.put<ItemPost>(`/admin/posts/${id}/status`, request);
  return response.data;
}

export async function deleteAdminPost(id: string): Promise<void> {
  await api.delete(`/admin/posts/${id}`);
}