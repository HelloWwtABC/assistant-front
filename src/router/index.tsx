import { Navigate, createBrowserRouter } from 'react-router-dom';

import { RouteErrorResult } from '@/components/common/RouteErrorResult';
import { APP_ROUTES } from '@/constants/routes';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardPage } from '@/pages/dashboard';
import { DocumentDetailPage } from '@/pages/documents/detail';
import { DocumentManagementPage } from '@/pages/documents';
import { LoginPage } from '@/pages/login';
import { NotFoundPage } from '@/pages/not-found';
import { ObservabilityPage } from '@/pages/observability';
import { RagQaPage } from '@/pages/qa';
import { SessionRecordsPage } from '@/pages/sessions';
import { ToolCenterPage } from '@/pages/tools';

import { AuthGuard, GuestGuard } from './guards';

export const router = createBrowserRouter([
  {
    path: APP_ROUTES.login,
    element: <GuestGuard />,
    errorElement: <RouteErrorResult />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <LoginPage />,
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
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={APP_ROUTES.dashboard} replace />,
          },
          {
            path: APP_ROUTES.dashboard.slice(1),
            element: <DashboardPage />,
          },
          {
            path: APP_ROUTES.documents.slice(1),
            element: <DocumentManagementPage />,
          },
          {
            path: APP_ROUTES.documentDetail().slice(1),
            element: <DocumentDetailPage />,
          },
          {
            path: APP_ROUTES.qa.slice(1),
            element: <RagQaPage />,
          },
          {
            path: APP_ROUTES.tools.slice(1),
            element: <ToolCenterPage />,
          },
          {
            path: APP_ROUTES.sessions.slice(1),
            element: <SessionRecordsPage />,
          },
          {
            path: APP_ROUTES.observability.slice(1),
            element: <ObservabilityPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
