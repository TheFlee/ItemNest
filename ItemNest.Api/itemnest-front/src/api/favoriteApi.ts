import api from "./axios";
import type { FavoriteItem, FavoriteStatus } from "../types/favorite";

export async function getMyFavorites(): Promise<FavoriteItem[]> {
  const response = await api.get<FavoriteItem[]>("/favorites/my");
  return response.data;
}

export async function addFavorite(itemPostId: string): Promise<void> {
  await api.post(`/favorites/${itemPostId}`);
}

export async function removeFavorite(itemPostId: string): Promise<void> {
  await api.delete(`/favorites/${itemPostId}`);
}

export async function getFavoriteStatus(itemPostId: string): Promise<FavoriteStatus> {
  const response = await api.get<FavoriteStatus>(`/favorites/${itemPostId}/status`);
  return response.data;
}