import { apiFetch, setToken } from "./api";
import type { User } from "../types";

type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

type ForgotPasswordResponse = {
  message: string;
  reset_url?: string | null;
};

export async function register(nombre: string, email: string, password: string): Promise<User> {
  const data = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ nombre, email, password }),
  });
  setToken(data.access_token);
  return data.user;
}

export async function login(email: string, password: string): Promise<User> {
  const data = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data.user;
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/auth/me");
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return apiFetch<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, new_password: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password }),
  });
}

export function logout(): void {
  setToken(null);
}
