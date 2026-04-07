import { mockDelay } from '@/shared/utils/mockDelay';
import type { AuthResponse, LoginInput, RegisterInput } from './types';

const MOCK_TOKENS = {
  accessToken: 'mock-access-token-vybe-xyz',
  refreshToken: 'mock-refresh-token-vybe-xyz',
};

export async function loginMock({ email }: LoginInput): Promise<AuthResponse> {
  await mockDelay(900);
  if (email !== 'test@vybe.app') {
    throw new Error('Invalid credentials');
  }
  return {
    ...MOCK_TOKENS,
    user: {
      id: 'mock-user-1',
      name: 'Alex Rivera',
      email: 'test@vybe.app',
      avatarUrl: 'https://i.pravatar.cc/150?u=mock-user-1',
    },
  };
}

export async function registerMock(data: RegisterInput): Promise<AuthResponse> {
  await mockDelay(1200);
  return {
    ...MOCK_TOKENS,
    user: {
      id: `mock-user-${Date.now()}`,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUri,
    },
  };
}

export async function forgotPasswordMock(_email: string): Promise<{ message: string }> {
  await mockDelay(700);
  return { message: 'Email sent' };
}
