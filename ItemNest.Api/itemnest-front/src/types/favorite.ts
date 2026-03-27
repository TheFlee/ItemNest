export interface FavoriteItem {
  id: string;
  itemPostId: string;
  title: string;
  categoryName: string;
  firstImageUrl: string;
  createdAt: string;
}

export interface FavoriteStatus {
  itemPostId: string;
  isFavorited: boolean;
}