import api from "./axios";
import type {
  CreatePostRequest,
  ItemPost,
  MatchedItemPost,
  PagedResponse,
  PostFilterParams,
  UpdatePostRequest,
} from "../types/post";

export async function getPosts(
  params: PostFilterParams
): Promise<PagedResponse<ItemPost>> {
  const response = await api.get<PagedResponse<ItemPost>>("/itemposts", { params });
  return response.data;
}

export async function getPostById(id: string): Promise<ItemPost> {
  const response = await api.get<ItemPost>(`/itemposts/${id}`);
  return response.data;
}

export async function getMyPosts(): Promise<ItemPost[]> {
  const response = await api.get<ItemPost[]>("/itemposts/my");
  return response.data;
}

export async function createPost(request: CreatePostRequest): Promise<ItemPost> {
  const response = await api.post<ItemPost>("/itemposts", request);
  return response.data;
}

export async function updatePost(
  id: string,
  request: UpdatePostRequest
): Promise<ItemPost> {
  const response = await api.put<ItemPost>(`/itemposts/${id}`, request);
  return response.data;
}

export async function deletePost(id: string): Promise<void> {
  await api.delete(`/itemposts/${id}`);
}

export async function getPostMatches(id: string): Promise<MatchedItemPost[]> {
  const response = await api.get<MatchedItemPost[]>(`/itemposts/${id}/matches`);
  return response.data;
}