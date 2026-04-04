import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { FullScreenLoading } from '@/components/status/FullScreenLoading';
import { APP_ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/auth';

export function AuthGuard() {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return <FullScreenLoading tip="正在恢复登录态" />;
  }

  if (!token) {
    return (
      <Navigate
        to={APP_ROUTES.login}
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
}

export function GuestGuard() {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return <FullScreenLoading tip="正在恢复登录态" />;
  }

  if (token) {
    return <Navigate to={APP_ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}
