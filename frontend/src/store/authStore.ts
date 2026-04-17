import { create } from 'zustand';
import { api } from '@/lib/api';
import type { User, AuthResult } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  signup: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    tenantId?: string;
    // B2C fields
    grade?: string;
    goal?: string;
    courseName?: string;
    referralCode?: string;
    preferredLang?: string;
  }) => Promise<void>;

  signupInstitution: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    institutionName: string;
    institutionType: string;
    phone?: string;
  }) => Promise<void>;

  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  reset: () => void;
  isB2CStudent: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  signup: async (data) => {
    const response = await api.post<{ data: AuthResult }>('/auth/signup', data);
    const { user, tokens } = response.data.data;

    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);

    set({ user, isAuthenticated: true, isLoading: false });
  },

  signupInstitution: async (data) => {
    const response = await api.post<{ data: AuthResult }>('/auth/signup/institution', data);
    const { user, tokens } = response.data.data;

    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);

    set({ user, isAuthenticated: true, isLoading: false });
  },

  login: async (email, password, rememberMe = false) => {
    const response = await api.post<{ data: AuthResult }>('/auth/login', {
      email,
      password,
    });
    const { user, tokens } = response.data.data;

    const storage = rememberMe ? localStorage : sessionStorage;
    // Clear both storages first to avoid stale tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');

    storage.setItem('accessToken', tokens.accessToken);
    storage.setItem('refreshToken', tokens.refreshToken);

    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue logout even if API call fails
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const response = await api.get<{ data: User }>('/auth/me');
      set({ user: response.data.data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  reset: () => {
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  isB2CStudent: () => {
    const user = get().user;
    return user?.accountType === 'B2C_STUDENT';
  },
}));
