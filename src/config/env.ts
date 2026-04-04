export const appEnv = {
  appTitle: import.meta.env.VITE_APP_TITLE ?? 'AI 知识库与工单智能体平台',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  useMock: import.meta.env.VITE_USE_MOCK !== 'false',
};
