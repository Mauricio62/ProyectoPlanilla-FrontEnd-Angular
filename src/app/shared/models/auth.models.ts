export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type?: string;
  username?: string;
  roles?: string[];
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  username: string | null;
  role: string | null;
}

export interface RoleDTO {
  value: string;
  description: string;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  roles: string[];
}