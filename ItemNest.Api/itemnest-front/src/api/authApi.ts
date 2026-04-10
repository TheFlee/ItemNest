import api from "./axios";
import type {
  AuthResponse,
  GoogleLoginRequest,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", request);
  return response.data;
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", request);
  return response.data;
}

export async function googleLogin(request: GoogleLoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/google", request);
  return response.data;
}