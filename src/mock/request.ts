export async function mockRequest<T>(executor: () => Promise<T> | T): Promise<T> {
  try {
    return await executor();
  } catch (error) {
    return Promise.reject(error);
  }
}
