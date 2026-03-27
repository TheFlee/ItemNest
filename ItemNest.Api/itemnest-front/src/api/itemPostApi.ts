import api from "./axios";
import type { CreatePostRequest, ItemPost, PagedResponse, PostFilterParams } from "../types/post";

export async function getPosts(params: PostFilterParams): Promise<PagedResponse<ItemPost>> {
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