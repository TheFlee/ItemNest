import api from './axios';
import type { ChatItem, ChatMessageItem } from '../types/chat';

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export async function getOrCreateChat(itemPostId: string): Promise<ChatItem> {
  const response = await api.post<ChatItem>('/chats', { itemPostId });
  return response.data;
}

export async function getUserChats(): Promise<ChatItem[]> {
  const response = await api.get<ChatItem[]>('/chats');
  return response.data;
}

export async function getChatMessages(
  chatId: string,
  page = 1,
  pageSize = 50
): Promise<PagedResponse<ChatMessageItem>> {
  const response = await api.get<PagedResponse<ChatMessageItem>>(
    `/chats/${chatId}/messages`,
    { params: { page, pageSize } }
  );
  return response.data;
}
