import { appEnv } from '@/config/env';
import { mockLogin } from '@/mock/auth';
import { mockRequest } from '@/mock/request';
import type { LoginPayload, LoginResult } from '@/types/auth';

import { request } from '../request';

export const authApi = {
  login(payload: LoginPayload) {
    if (appEnv.useMock) {
      return mockRequest(() => mockLogin(payload));
    }

    return request.post<LoginResult, LoginPayload>('/auth/login', payload, {
      skipAuthRedirect: true,
    });
  },
};
