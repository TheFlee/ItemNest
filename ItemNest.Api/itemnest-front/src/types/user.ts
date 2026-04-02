export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  isBlocked: boolean;
  createdAt: string;
}

export interface UpdateMyEmailRequest {
  newEmail: string;
  currentPassword: string;
}

export interface ChangeMyPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  isBlocked: boolean;
  createdAt: string;
}

export interface AdminUpdateUserRoleRequest {
  role: string;
}

export interface AdminUpdateUserBlockStatusRequest {
  isBlocked: boolean;
}