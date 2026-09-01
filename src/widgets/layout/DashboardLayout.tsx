import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../sidebar/Sidebar';
import styles from './DashboardLayout.module.scss';
import { ErrorBoundary } from '../../shared/ui/confirm-dialog/ErrorBoundary';

export const DashboardLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className={`${styles.layout} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <main className={styles.mainContent}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};
