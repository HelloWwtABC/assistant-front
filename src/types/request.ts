import type { AxiosRequestConfig } from 'axios';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface RequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  skipAuthRedirect?: boolean;
  skipErrorToast?: boolean;
}
