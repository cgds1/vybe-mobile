import { forgotPasswordApi, loginApi, logoutApi, registerApi } from './auth.api';
import type { LoginInput, RegisterInput } from './types';

export const login = (input: LoginInput) => loginApi(input);
export const register = (input: RegisterInput) => registerApi(input);
export const forgotPassword = (email: string) => forgotPasswordApi(email);
export const logout = () => logoutApi();

export type { AuthResponse, LoginInput, RegisterInput } from './types';
