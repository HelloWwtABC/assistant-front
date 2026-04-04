import axios, { AxiosHeaders, type AxiosError } from 'axios';
import { message } from 'antd';

import { appEnv } from '@/config/env';
import { APP_ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/auth';
import type { ApiResponse, RequestConfig } from '@/types/request';

interface ErrorResponse {
  message?: string;
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'data' in value
  );
}

function redirectToLogin() {
  useAuthStore.getState().clearSession();

  if (window.location.pathname !== APP_ROUTES.login) {
    window.location.replace(APP_ROUTES.login);
  }
}

const service = axios.create({
  baseURL: appEnv.apiBaseUrl,
  timeout: 15000,
});

service.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    const headers = AxiosHeaders.from(config.headers);

    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

service.interceptors.response.use(
  (response) => {
    const currentConfig = response.config as RequestConfig | undefined;
    const payload = response.data;

    if (isApiResponse(payload)) {
      if (payload.code !== 0) {
        if (!currentConfig?.skipErrorToast) {
          message.error(payload.message || '请求失败，请稍后重试');
        }

        return Promise.reject(new Error(payload.message || 'Request failed.'));
      }

      return payload.data;
    }

    return payload;
  },
  (error: AxiosError<ErrorResponse>) => {
    const currentConfig = error.config as RequestConfig | undefined;
    const status = error.response?.status;
    const errorMessage =
      error.response?.data?.message ?? error.message ?? '网络异常，请稍后重试';

    if (status === 401 && !currentConfig?.skipAuthRedirect) {
      if (!currentConfig?.skipErrorToast) {
        message.warning('登录状态已失效，请重新登录');
      }

      redirectToLogin();

      return Promise.reject(error);
    }

    if (!currentConfig?.skipErrorToast) {
      message.error(errorMessage);
    }

    return Promise.reject(error);
  },
);

export const request = {
  get<T>(url: string, config?: RequestConfig) {
    return service.get<ApiResponse<T>, T>(url, config);
  },
  post<T, D = unknown>(url: string, data?: D, config?: RequestConfig<D>) {
    return service.post<ApiResponse<T>, T, D>(url, data, config);
  },
  put<T, D = unknown>(url: string, data?: D, config?: RequestConfig<D>) {
    return service.put<ApiResponse<T>, T, D>(url, data, config);
  },
  patch<T, D = unknown>(url: string, data?: D, config?: RequestConfig<D>) {
    return service.patch<ApiResponse<T>, T, D>(url, data, config);
  },
  delete<T>(url: string, config?: RequestConfig) {
    return service.delete<ApiResponse<T>, T>(url, config);
  },
};
