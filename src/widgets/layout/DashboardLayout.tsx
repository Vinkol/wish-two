import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../sidebar/Sidebar';
import styles from './DashboardLayout.module.scss';

export const DashboardLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};
