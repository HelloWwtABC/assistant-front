export const APP_ROUTES = {
  root: '/',
  login: '/login',
  dashboard: '/dashboard',
  documents: '/documents',
  documentDetail: (documentId = ':documentId') => `/documents/${documentId}`,
  qa: '/qa',
  tools: '/tools',
  sessions: '/sessions',
  observability: '/observability',
} as const;
