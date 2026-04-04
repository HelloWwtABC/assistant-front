import { message } from 'antd';

export async function mockRequest<T>(executor: () => Promise<T> | T): Promise<T> {
  try {
    return await executor();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '模拟请求失败';

    message.error(errorMessage);

    return Promise.reject(error);
  }
}
