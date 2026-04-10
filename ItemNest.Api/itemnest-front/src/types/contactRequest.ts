export interface CreateContactRequestRequest {
  itemPostId: string;
  message: string;
}

export interface ContactRequestItem {
  id: string;
  itemPostId: string;
  itemPostTitle: string;
  requesterUserId: string;
  requesterFullName: string;
  requesterEmail: string | null;
  postOwnerUserId: string;
  postOwnerFullName: string;
  postOwnerEmail: string | null;
  message: string;
  status: number;
  createdAt: string;
  respondedAt: string | null;
}