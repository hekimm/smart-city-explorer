import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Category } from '@/types';

interface CategoryButtonProps {
  category: Category;
  isSelected?: boolean;
  onPress: () => void;
}

export default function CategoryButton({ category, isSelected, onPress }: CategoryButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSelected && styles.buttonActive,
        { borderColor: category.color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{category.icon}</Text>
      <Text style={[styles.name, isSelected && styles.nameActive]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 3,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  nameActive: {
    color: '#1E40AF',
  },
});
