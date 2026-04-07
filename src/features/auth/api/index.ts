import { forgotPasswordApi, loginApi, registerApi } from './auth.api';
import { forgotPasswordMock, loginMock, registerMock } from './auth.mock';
import type { LoginInput, RegisterInput } from './types';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export const login = (input: LoginInput) =>
  USE_MOCK ? loginMock(input) : loginApi(input);

export const register = (input: RegisterInput) =>
  USE_MOCK ? registerMock(input) : registerApi(input);

export const forgotPassword = (email: string) =>
  USE_MOCK ? forgotPasswordMock(email) : forgotPasswordApi(email);

export type { AuthResponse, LoginInput, RegisterInput } from './types';
