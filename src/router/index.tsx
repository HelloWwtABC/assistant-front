/* eslint-disable react-refresh/only-export-components */

import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import { RouteErrorResult } from '@/components/common/RouteErrorResult';
import { FullScreenLoading } from '@/components/status/FullScreenLoading';
import { APP_ROUTES } from '@/constants/routes';

import { AuthGuard, GuestGuard } from './guards';

const AppLayout = lazy(() =>
  import('@/layouts/AppLayout').then((module) => ({
    default: module.AppLayout,
  })),
);
const AuthLayout = lazy(() =>
  import('@/layouts/AuthLayout').then((module) => ({
    default: module.AuthLayout,
  })),
);
const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then((module) => ({
    default: module.DashboardPage,
  })),
);
const DocumentManagementPage = lazy(() =>
  import('@/pages/documents').then((module) => ({
    default: module.DocumentManagementPage,
  })),
);
const DocumentDetailPage = lazy(() =>
  import('@/pages/documents/detail').then((module) => ({
    default: module.DocumentDetailPage,
  })),
);
const LoginPage = lazy(() =>
  import('@/pages/login').then((module) => ({
    default: module.LoginPage,
  })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((module) => ({
    default: module.NotFoundPage,
  })),
);
const ObservabilityPage = lazy(() =>
  import('@/pages/observability').then((module) => ({
    default: module.ObservabilityPage,
  })),
);
const RagQaPage = lazy(() =>
  import('@/pages/qa').then((module) => ({
    default: module.RagQaPage,
  })),
);
const SessionRecordsPage = lazy(() =>
  import('@/pages/sessions').then((module) => ({
    default: module.SessionRecordsPage,
  })),
);
const ToolCenterPage = lazy(() =>
  import('@/pages/tools').then((module) => ({
    default: module.ToolCenterPage,
  })),
);

function withLoading(node: ReactNode) {
  return <Suspense fallback={<FullScreenLoading />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: APP_ROUTES.login,
    element: <GuestGuard />,
    errorElement: <RouteErrorResult />,
    children: [
      {
        element: withLoading(<AuthLayout />),
        children: [
          {
            index: true,
            element: withLoading(<LoginPage />),
          },
        ],
      },
    ],
  },
  {
    path: APP_ROUTES.root,
    element: <AuthGuard />,
    errorElement: <RouteErrorResult />,
    children: [
      {
        element: withLoading(<AppLayout />),
        children: [
          {
            index: true,
            element: <Navigate to={APP_ROUTES.dashboard} replace />,
          },
          {
            path: APP_ROUTES.dashboard.slice(1),
            element: withLoading(<DashboardPage />),
          },
          {
            path: APP_ROUTES.documents.slice(1),
            element: withLoading(<DocumentManagementPage />),
          },
          {
            path: APP_ROUTES.documentDetail().slice(1),
            element: withLoading(<DocumentDetailPage />),
          },
          {
            path: APP_ROUTES.qa.slice(1),
            element: withLoading(<RagQaPage />),
          },
          {
            path: APP_ROUTES.tools.slice(1),
            element: withLoading(<ToolCenterPage />),
          },
          {
            path: APP_ROUTES.sessions.slice(1),
            element: withLoading(<SessionRecordsPage />),
          },
          {
            path: APP_ROUTES.observability.slice(1),
            element: withLoading(<ObservabilityPage />),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: withLoading(<NotFoundPage />),
  },
]);
