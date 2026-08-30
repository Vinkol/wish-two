import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Gift, Compass, Wallet, LogOut, Heart, Settings, Sun, Moon } from 'lucide-react';
import type { AppDispatch, RootState } from '../../shared/store/store';
import { logoutUser } from '../../features/auth/model/authActions';
import { toggleTheme } from '../../entities/user/model/authSlice';
import styles from './Sidebar.module.scss';

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <Heart color="#6366f1" fill="#6366f1" size={24} />
        <span className={styles.logoText}>WishTwo</span>
      </div>

      <nav className={styles.navigation}>
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
        >
          <Gift size={20} />
          <span>Вещи</span>
        </NavLink>

        <NavLink
          to="/dashboard/travel"
          className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
        >
          <Compass size={20} />
          <span>Путешествия</span>
        </NavLink>

        <NavLink
          to="/dashboard/finance"
          className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
        >
          <Wallet size={20} />
          <span>Общий счет</span>
        </NavLink>

        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
        >
          <Settings size={20} />
          <span>Настройки</span>
        </NavLink>
      </nav>

      <div className={styles.footerSection}>
        {/* Кнопка смены темы */}
        <button onClick={() => dispatch(toggleTheme())} className={styles.themeButton}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span>{theme === 'light' ? 'Темная тема' : 'Светлая тема'}</span>
        </button>

        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogOut size={20} />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
};
