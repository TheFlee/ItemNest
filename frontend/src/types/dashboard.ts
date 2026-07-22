export interface MyDashboard {
  myPostsCount: number;
  openPostsCount: number;
  returnedPostsCount: number;
  closedPostsCount: number;
  favoritesCount: number;
  myReportsCount: number;
}

export interface AdminDashboard {
  totalUsersCount: number;
  totalPostsCount: number;
  openPostsCount: number;
  returnedPostsCount: number;
  closedPostsCount: number;
  totalCategoriesCount: number;
  pendingReportsCount: number;
}