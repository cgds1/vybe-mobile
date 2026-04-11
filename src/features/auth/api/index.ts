import {
  forgotPasswordApi,
  loginApi,
  logoutApi,
  registerApi,
  resendVerificationApi,
  resetPasswordApi,
  verifyEmailApi,
} from './auth.api';
import type { LoginInput, RegisterInput } from './types';

export const login = (input: LoginInput) => loginApi(input);
export const register = (input: RegisterInput) => registerApi(input);
export const forgotPassword = (email: string) => forgotPasswordApi(email);
export const verifyEmail = (email: string, code: string) => verifyEmailApi(email, code);
export const resendVerification = (email: string) => resendVerificationApi(email);
export const resetPassword = (email: string, code: string, newPassword: string) =>
  resetPasswordApi(email, code, newPassword);
export const logout = () => logoutApi();

export type { AuthResponse, LoginInput, RegisterInput } from './types';
