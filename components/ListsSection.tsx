import { List } from '~/types/supabaseTypes';
import { View, Text } from 'react-native';
import { Star, Library, CheckCircle2, Clapperboard } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useLists } from '~/store/listStore';
import { useRouter } from 'expo-router';
export default function ListsSection() {
  const theme = useTheme();
  const { lists } = useLists();
  const router = useRouter();
  const getIconForList = (list: List) => {
    switch (list.list_type) {
      case 'favorites':
        return <Star size={16} color={theme.primary[600]} />;
      case 'watchlist':
        return <Library size={16} color={theme.primary[600]} />;
      case 'watched':
        return <CheckCircle2 size={16} color={theme.primary[600]} />;
      default:
        return <Clapperboard size={16} color={theme.primary[600]} />; // fallback for custom
    }
  };


  return (
    <View className="mb-8">
      <Text className="mb-2 font-SpaceGrotesk-Regular text-lg text-primary-950 dark:text-primary-50">
        Lists
      </Text>

      <View className="-mx-1 flex-row flex-wrap">
        {lists.map((list: List) => (
          <View key={list.id} className="mb-2 w-1/3 px-1">
            <View className="h-20 items-center justify-center rounded-lg bg-primary-200 p-4 dark:bg-primary-900">
              {getIconForList(list)}
              <Text
                className="mt-2 text-center font-SpaceGrotesk-Regular text-xs text-primary-700 dark:text-primary-300"
                numberOfLines={2}
                ellipsizeMode="tail">
                {list.name}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
