export interface ChatItem {
  id: string;
  itemPostId: string;
  itemPostTitle: string;
  itemPostSlug: string;
  otherUserId: string;
  otherUserFullName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
}

export interface ChatMessageItem {
  id: string;
  chatId: string;
  senderId: string;
  senderFullName: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}
