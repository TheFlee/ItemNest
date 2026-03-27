export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}