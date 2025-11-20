import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    set({ user: data.user ? { id: data.user.id, email: data.user.email! } : null });
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    set({ user: data.user ? { id: data.user.id, email: data.user.email! } : null });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  checkAuth: async () => {
    const { data } = await supabase.auth.getSession();
    set({
      user: data.session?.user ? { id: data.session.user.id, email: data.session.user.email! } : null,
      loading: false,
    });
  },
}));
