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
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Media } from '~/types/supabaseTypes';
import { useState } from 'react';

interface MediaRowSectionProps {
  title: string;
  movies: Media[];
  onAddToLibrary: (mediaId: number) => Promise<void>;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.38;

export default function MediaRowSection({ title, movies, onAddToLibrary }: MediaRowSectionProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  return (
    <View className="px-4">
      {/* Section Title */}
      <Text className="mb-3 font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
        {title}
      </Text>

      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mr-3"
            activeOpacity={0.85}
            onPress={() => {
              router.push({
                pathname: '/media/[id]',
                params: {
                  id: item.id.toString(),
                  mediaData: JSON.stringify(item),
                },
              });
            }}>
            <View className="relative w-32 overflow-hidden rounded-xl">
              {/* Poster */}
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w342${item.poster_path}` }}
                className="h-48 w-full"
                resizeMode="cover"
              />

              {/* Add Button */}
              <TouchableOpacity
                disabled={loadingId === item.id}
                onPress={async () => {
                  setLoadingId(item.id);
                  await onAddToLibrary(item.id);
                  setLoadingId(null);
                }}
                className="absolute right-2 top-2 rounded-full  "
                activeOpacity={0.7}>
                <BlurView
                  intensity={75}
                  className="p-2"
                  tint="systemMaterialDark"
                  style={{ borderRadius: 50, overflow: 'hidden' }}>
                  {loadingId === item.id ? (
                    <ActivityIndicator size={16} />
                  ) : (
                    <Plus size={16} color="white" />
                  )}
                </BlurView>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
