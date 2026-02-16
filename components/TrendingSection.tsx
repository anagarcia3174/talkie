import { BlurView } from 'expo-blur';
import { Star, Plus, Library } from 'lucide-react-native';
import { Image, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Media } from '~/types/supabaseTypes';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const { width } = Dimensions.get('window');

interface TrendingSectionProps {
  movies: Media[];
  onAddToLibrary: (mediaId: number) => Promise<void>;
  title: string;
}

export default function TrendingSection({ movies, onAddToLibrary, title }: TrendingSectionProps) {
  const router = useRouter();
  const [ isScrolling, setIsScrolling] = useState(false);

  return (
    <View className="px-4">
      <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
        {title}
      </Text>

      <Carousel
        width={width}
        height={200}
        style={{ alignSelf: 'center' }}
        data={movies}
        loop
        autoPlay={false}
        scrollAnimationDuration={600}
        onScrollStart={() => setIsScrolling(true)}
        onScrollEnd={() => setIsScrolling(false)}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isScrolling}
            onPress={() => {
              if(isScrolling) return;
              router.push({
                pathname: '/media/[id]',
                params: {
                  id: item.id.toString(),
                  mediaData: JSON.stringify(item),
                },
              });
            }}>
            <View className="overflow-hidden rounded-xl">
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w500${item.backdrop_path}` }}
                className="h-60 w-full"
                resizeMode="cover"
              />
              <BlurView
                intensity={60}
                tint="systemMaterialDark"
                className="absolute bottom-0 h-20 w-full overflow-hidden rounded-b-xl">
                <View className="flex-row items-center justify-between p-4">
                  <View
                    style={{
                      minWidth: 120,
                      maxWidth: '75%',
                    }}>
                    <Text
                      className="font-SpaceGrotesk-SemiBold text-xl text-primary-50"
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {item.title}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      <Text className="text-md font-SpaceGrotesk-Regular text-primary-200">
                        {item.release_date?.split('-')[0]} 
                      </Text>

                      <View className="flex-row items-center gap-x-1">
                        <Text className="text-md font-SpaceGrotesk-Regular text-primary-200">
                          {item.vote_average?.toFixed(1)}
                        </Text>
                        <Star size={14} color="gold" fill="gold" />
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => onAddToLibrary(item.id)}
                    className="flex-row items-center justify-center gap-x-2 rounded-full border border-primary-200 px-3 py-2">
                    <Plus size={16} color="white" />
                    <Library size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
