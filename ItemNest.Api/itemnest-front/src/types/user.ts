export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  createdAt: string;
}

export interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  createdAt: string;
}

export interface AdminUpdateUserRoleRequest {
  role: string;
}