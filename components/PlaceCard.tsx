import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from '@/types';
import { getCategoryIcon, getCategoryColor } from '@/lib/categories';

interface PlaceCardProps {
  place: Place;
  onPress?: () => void;
  showDistance?: boolean;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}

export default function PlaceCard({ 
  place, 
  onPress, 
  showDistance = true,
  onFavoritePress,
  isFavorite = false 
}: PlaceCardProps) {
  const iconName = getCategoryIcon(place.category);
  const color = getCategoryColor(place.category);

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={iconName as any} size={24} color={color} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {place.name}
          </Text>
          {onFavoritePress && (
            <TouchableOpacity 
              onPress={onFavoritePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={isFavorite ? 'heart' : 'heart-outline'} 
                size={24} 
                color={isFavorite ? '#EF4444' : '#9CA3AF'} 
              />
            </TouchableOpacity>
          )}
        </View>
        
        {place.address && (
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.address} numberOfLines={1}>
              {place.address}
            </Text>
          </View>
        )}
        
        <View style={styles.footer}>
          {place.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.rating}>{place.rating.toFixed(1)}</Text>
            </View>
          )}
          
          {showDistance && place.distance && (
            <View style={styles.distanceContainer}>
              <Ionicons name="navigate" size={14} color="#1E40AF" />
              <Text style={styles.distance}>
                {place.distance < 1
                  ? `${(place.distance * 1000).toFixed(0)}m`
                  : `${place.distance.toFixed(1)}km`}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  address: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
});
