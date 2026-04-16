import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Media } from '~/types/supabaseTypes';
import { useState } from 'react';
import { haptics } from '~/utils/haptics';

interface MediaRowSectionProps {
  title: string;
  movies: Media[];
  onAddToLibrary: (mediaId: number) => Promise<void>;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const BENTO_CARD_WIDTH = Math.round((SCREEN_WIDTH - 32) * 0.4);
const ITEM_GAP = 12;

export default function MediaRowSection({ title, movies, onAddToLibrary }: MediaRowSectionProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  return (
    <View className="px-4">
      <Text className="mb-2 font-SpaceGrotesk-SemiBold text-sm uppercase tracking-wide text-primary-500 dark:text-primary-400">
        {title}
      </Text>

      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={BENTO_CARD_WIDTH + ITEM_GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{ paddingRight: 4 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            style={{ width: BENTO_CARD_WIDTH, marginRight: ITEM_GAP }}
            onPress={() => {
              router.push({
                pathname: '/media/[id]',
                params: {
                  id: item.id.toString(),
                  mediaData: JSON.stringify(item),
                },
              });
            }}>
            <View className="relative rounded-2xl border border-primary-200 bg-primary-100 p-1 dark:border-primary-800 dark:bg-primary-900">
              <View className="overflow-hidden rounded-xl bg-primary-200 dark:bg-primary-800">
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w342${item.poster_path}` }}
                  style={{ width: '100%', aspectRatio: 2 / 3 }}
                  resizeMode="cover"
                />
              </View>

              <TouchableOpacity
                disabled={loadingId === item.id}
                onPress={async () => {
                  haptics.action();
                  setLoadingId(item.id);
                  await onAddToLibrary(item.id);
                  setLoadingId(null);
                }}
                className="absolute right-3 top-3 rounded-lg border border-primary-50/20 bg-primary-950/45 p-1"
                activeOpacity={0.85}>
                {loadingId === item.id ? (
                  <ActivityIndicator size="small" color="#fafafa" />
                ) : (
                  <Plus size={17} color="#fafafa" strokeWidth={2.25} />
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
