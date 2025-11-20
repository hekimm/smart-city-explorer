import { create } from 'zustand';
import { Place } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

interface FavoritesState {
  favorites: Place[];
  isLoading: boolean;
  
  addFavorite: (place: Place) => Promise<void>;
  removeFavorite: (placeId: string) => Promise<void>;
  isFavorite: (placeId: string) => boolean;
  loadFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,

  addFavorite: async (place: Place) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        console.log('⚠️ Kullanıcı giriş yapmamış');
        return;
      }

      const { favorites } = get();
      
      // Zaten favorilerde mi kontrol et
      if (favorites.some(f => f.id === place.id)) {
        console.log('⚠️ Zaten favorilerde');
        return;
      }

      // Supabase'e kaydet
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          place_id: place.id,
          name: place.name,
          lat: place.lat,
          lng: place.lng,
          category: place.category,
          address: place.address,
          rating: place.rating,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase favori ekleme hatası:', error);
        throw error;
      }

      // Local state'i güncelle
      const newFavorites = [...favorites, place];
      set({ favorites: newFavorites });
      
      console.log('✅ Favorilere eklendi:', place.name);
    } catch (error) {
      console.error('❌ Favori ekleme hatası:', error);
      throw error;
    }
  },

  removeFavorite: async (placeId: string) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        console.log('⚠️ Kullanıcı giriş yapmamış');
        return;
      }

      // Supabase'den sil
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', placeId);

      if (error) {
        console.error('❌ Supabase favori silme hatası:', error);
        throw error;
      }

      // Local state'i güncelle
      const { favorites } = get();
      const newFavorites = favorites.filter(f => f.id !== placeId);
      set({ favorites: newFavorites });
      
      console.log('✅ Favorilerden çıkarıldı');
    } catch (error) {
      console.error('❌ Favori çıkarma hatası:', error);
      throw error;
    }
  },

  isFavorite: (placeId: string) => {
    const { favorites } = get();
    return favorites.some(f => f.id === placeId);
  },

  loadFavorites: async () => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        set({ favorites: [], isLoading: false });
        return;
      }

      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Favori yükleme hatası:', error);
        throw error;
      }

      // Supabase'den gelen veriyi Place formatına çevir
      const favorites: Place[] = (data || []).map((fav: any) => ({
        id: fav.place_id,
        name: fav.name,
        lat: fav.lat,
        lng: fav.lng,
        category: fav.category,
        address: fav.address,
        rating: fav.rating,
      }));

      set({ favorites, isLoading: false });
      console.log('✅ Favoriler yüklendi:', favorites.length);
    } catch (error) {
      console.error('❌ Favori yükleme hatası:', error);
      set({ favorites: [], isLoading: false });
    }
  },
}));
