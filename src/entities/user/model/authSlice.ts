import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  partnerId?: string | null;
  partnerInfo?: PartnerInfo | null;
}

interface AuthState {
  user: UserProfile | null;
  isAuth: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark';
}

interface PartnerInfo {
  fullName: string;
  avatarUrl: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuth: false,
  isLoading: true,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuth = !!action.payload;
      state.isLoading = false;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.isAuth = false;
      state.isLoading = false;
    },
    toggleTheme: (state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = nextTheme;
      localStorage.setItem('theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    },
  },
});

export const { setUser, logoutSuccess, toggleTheme } = authSlice.actions;
export default authSlice.reducer;
