import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LoadingOverlay, Box } from '@mantine/core';
import { PresentationPage } from '../pages/presentation/PresentationPage';
import { AuthPage } from '../pages/auth/AuthPage';
import { WishlistPage } from '../pages/wishlist/WishlistPage';
import { DashboardLayout } from '../widgets/layout/DashboardLayout';
import type { AppDispatch, RootState } from '../shared/store/store';
import { initAuthListener } from '../features/auth/model/authActions';
import { TravelPage } from '../pages/travel/TravelPage';
import { FinancePage } from '../pages/finance/FinancePage';
import { SettingsPage } from '../pages/settings/SettingsPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuth, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return (
      <Box style={{ height: '100vh', position: 'relative' }}>
        <LoadingOverlay visible overlayProps={{ blur: 2 }} />
      </Box>
    );
  }

  return isAuth ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    let unsubscribeFn: (() => void) | null = null;

    const startListener = async () => {
      const unsubscribe = await dispatch(initAuthListener());
      unsubscribeFn = unsubscribe;
    };

    startListener();

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    return () => {
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    };
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box style={{ height: '100vh', position: 'relative' }}>
        <LoadingOverlay visible overlayProps={{ blur: 2 }} />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные экраны */}
        <Route path="/" element={<PresentationPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Приватная зона */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WishlistPage />} />
          <Route path="travel" element={<TravelPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
