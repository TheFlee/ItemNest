export interface ItemImage {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export interface ItemPost {
  id: string;
  title: string;
  description: string;
  type: number;
  status: number;
  color: number;
  location: string;
  eventDate: string;
  createdAt: string;
  updatedAt: string | null;
  categoryId: number;
  categoryName: string;
  userId: string;
  userFullName: string;
  primaryImageUrl: string;
  isOwner: boolean;
  isFavorited: boolean;
  images: ItemImage[];
}

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PostFilterParams {
  pageNumber?: number;
  pageSize?: number;
  type?: number;
  status?: number;
  color?: number;
  categoryId?: number;
  location?: string;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface CreatePostRequest {
  title: string;
  description: string;
  type: number;
  color: number;
  location: string;
  eventDate: string;
  categoryId: number;
}