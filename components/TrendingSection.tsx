import { BlurView } from 'expo-blur';
import { Star, Plus, Library } from 'lucide-react-native';
import { Image, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { TMDBBaseMedia } from '~/types/tmdbTypes';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface TrendingSectionProps {
  movies: TMDBBaseMedia[];
}

export default function TrendingSection({ movies }: TrendingSectionProps) {
  return (
    <View className="p-4">
      <Text className="font-SpaceGrotesk-SemiBold text-2xl text-primary-950 dark:text-primary-50">
        Trending
      </Text>

      <Carousel
        width={width} // slightly narrower than screen
        height={200} // give items a fixed height
        style={{ alignSelf: 'center' }} // keeps it centered
        data={movies}
        loop
        autoPlay={false}
        scrollAnimationDuration={600}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9, // slight zoom effect
          parallaxScrollingOffset: 50, // offset for depth
        }}
        renderItem={({ item }) => (
          <View className="overflow-hidden rounded-xl">
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${item.backdrop_path}` }}
              className="h-60 w-full"
              resizeMode="cover"
            />
            <BlurView
              intensity={60}
              tint='systemMaterialDark'
              className="absolute bottom-0 h-20 w-full overflow-hidden rounded-b-xl">
              <View className="flex-row items-center justify-between p-4">
                <View
                  style={{
                    minWidth: 120, // ensures spacing even for very short titles
                    maxWidth: '75%', // caps it at half the carousel width
                  }}>
                  <Text
                    className="font-SpaceGrotesk-SemiBold text-xl text-primary-50"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    >
                    {item.title || item.name}
                  </Text>

                  <View className="flex-row items-center justify-between">
                    <Text className="text-md font-SpaceGrotesk-Regular text-primary-200">
                      {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}
                    </Text>

                    <View className="flex-row items-center gap-x-1">
                      <Text className="text-md font-SpaceGrotesk-Regular text-primary-200">
                        {item.vote_average?.toFixed(1)}
                      </Text>
                      <Star size={14} color="gold" fill="gold" />
                    </View>
                  </View>
                </View>

                <TouchableOpacity className="flex-row items-center justify-center gap-x-2 rounded-full border border-primary-200 px-3 py-2">
                  <Plus size={16} color="white" />
                  <Library size={16} color="white" />
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        )}
      />
    </View>
  );
}