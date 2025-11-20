import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

interface SearchHistoryItem {
  id: string;
  user_id: string;
  query: string;
  lat?: number;
  lng?: number;
  category?: string;
  created_at: string;
}

interface SearchHistoryState {
  history: SearchHistoryItem[];
  isLoading: boolean;
  
  addSearch: (query: string, lat?: number, lng?: number, category?: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useSearchHistoryStore = create<SearchHistoryState>((set, get) => ({
  history: [],
  isLoading: false,

  addSearch: async (query: string, lat?: number, lng?: number, category?: string) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        console.log('⚠️ Kullanıcı giriş yapmamış, arama geçmişi kaydedilmedi');
        return;
      }

      // Supabase'e kaydet
      const { data, error } = await supabase
        .from('search_history')
        .insert({
          user_id: user.id,
          query,
          lat,
          lng,
          category,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Arama geçmişi kaydetme hatası:', error);
        return;
      }

      // Local state'i güncelle
      const { history } = get();
      set({ history: [data, ...history] });
      
      console.log('✅ Arama geçmişe eklendi:', query);
    } catch (error) {
      console.error('❌ Arama geçmişi kaydetme hatası:', error);
    }
  },

  loadHistory: async () => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ history: [], isLoading: false });
        return;
      }

      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Arama geçmişi yükleme hatası:', error);
        throw error;
      }

      set({ history: data || [], isLoading: false });
      console.log('✅ Arama geçmişi yüklendi:', data?.length || 0);
    } catch (error) {
      console.error('❌ Arama geçmişi yükleme hatası:', error);
      set({ history: [], isLoading: false });
    }
  },

  clearHistory: async () => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;

      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Arama geçmişi silme hatası:', error);
        throw error;
      }

      set({ history: [] });
      console.log('✅ Arama geçmişi temizlendi');
    } catch (error) {
      console.error('❌ Arama geçmişi silme hatası:', error);
      throw error;
    }
  },
}));
