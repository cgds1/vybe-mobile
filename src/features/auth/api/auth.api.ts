import { apiClient } from '@/services/api/client';
import type { AuthResponse, LoginInput, RegisterInput } from './types';

export async function loginApi(input: LoginInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', input);
  return data;
}

export async function registerApi(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', input);
  return data;
}

export async function forgotPasswordApi(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  return data;
}

export async function verifyEmailApi(email: string, code: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/verify-email', { email, code });
  return data;
}

export async function resendVerificationApi(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/resend-verification', { email });
  return data;
}

export async function resetPasswordApi(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/reset-password', {
    email,
    code,
    newPassword,
  });
  return data;
}

export async function logoutApi(): Promise<void> {
  await apiClient.post('/auth/logout');
}
