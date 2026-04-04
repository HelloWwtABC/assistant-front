import type { LoginPayload, LoginResult } from '@/types/auth';
import { sleep } from '@/utils/sleep';

const DEMO_ACCOUNT = {
  username: 'admin',
  password: 'Admin123456',
};

const MOCK_USER = {
  id: 'user_admin_001',
  name: '平台管理员',
  email: 'admin@example.com',
  role: '系统管理员',
};

export async function mockLogin(payload: LoginPayload): Promise<LoginResult> {
  await sleep(700);

  if (
    payload.username !== DEMO_ACCOUNT.username ||
    payload.password !== DEMO_ACCOUNT.password
  ) {
    throw new Error('用户名或密码错误，请使用演示账号：admin / Admin123456');
  }

  return {
    token: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: MOCK_USER,
  };
}
