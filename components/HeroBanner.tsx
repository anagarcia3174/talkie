import { TMDBBaseMedia } from '~/types/tmdbTypes';
import { View, Image, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { Check, MessageSquareMore, Plus, Star } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '~/hooks/useTheme';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280'; // Full size for backdrop
const TMDB_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Poster size

interface HeroBannerProps {
  media: TMDBBaseMedia;
  onMarkWatched?: () => void;
  onAddToList?: () => void;
}

export default function HeroBanner({ media, onMarkWatched, onAddToList }: HeroBannerProps) {
  const title = media.title || media.name || '';
  const backdropUrl = media.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL}${media.backdrop_path}`
    : undefined;
  const posterUrl = media.poster_path
    ? `${TMDB_POSTER_BASE_URL}${media.poster_path}`
    : undefined;
    const theme = useTheme();

 return (
  <View className="aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-lg">
    {backdropUrl ? (
      <ImageBackground
        source={{ uri: backdropUrl }}
        className="w-full h-full"
        resizeMode="cover"
      >
        {/* Heavy blur overlay for background */}
        <BlurView 
          intensity={30} 
          tint={theme.isDark ? 'dark' : 'light'
          }
          className="absolute inset-0"
        >
          {/* Dark overlay for better contrast */}
          <View className="absolute inset-0 bg-primary-950/40 dark:bg-primary-900/60" />
          
          <View className="flex-row h-full">
            {/* Left side - Content */}
            <View className="flex-1 p-5 justify-between">
              {/* Top section - Title and info */}
              <View>
                <Text 
                  className="text-primary-50 dark:text-primary-100 text-xl font-bold leading-tight mb-2" 
                  numberOfLines={2}
                  style={{
                    textShadowColor: 'rgba(0, 0, 0, 0.8)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3
                  }}
                >
                  {title}
                </Text>
                
                {/* Rating and year */}
                <View className="flex-row items-center mb-3">
                  <View className="flex-row items-center">
                    <Star size={14} color="#facc15" fill="#facc15" />
                    <Text className="ml-1 text-sm font-semibold text-primary-300 dark:text-primary-200">
                      {media.vote_average.toFixed(1)}
                    </Text>
                  </View>
                  {(media.release_date || media.first_air_date) && (
                    <Text className="ml-3 text-sm text-primary-300 dark:text-primary-400">
                      {new Date(media.release_date || media.first_air_date!).getFullYear()}
                    </Text>
                  )}
                </View>
              </View>
              
              {/* Bottom section - Buttons */}
              <View className="flex-row gap-x-3 mt-4">
                <TouchableOpacity
                  className="flex-row items-center border border-primary-400/50 dark:border-primary-300/50 bg-primary-100/20 dark:bg-primary-200/20 px-4 py-2.5 rounded-full"
                  onPress={onMarkWatched}
                >
                  <MessageSquareMore size={16} color="white" />
                  <Text className="ml-2 text-sm font-semibold text-primary-50 dark:text-primary-100">
                    Review
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-row items-center border border-primary-400/50 dark:border-primary-300/50 bg-primary-100/20 dark:bg-primary-200/20 px-4 py-2.5 rounded-full"
                  onPress={onAddToList}
                >
                  <Plus size={16} color="white" />
                  <Text className="ml-2 text-sm font-semibold text-primary-50 dark:text-primary-100">
                    Watchlist
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Right side - Poster */}
            <View className="w-32 h-full">
              {posterUrl ? (
                <Image
                  source={{ uri: posterUrl }}
                  className="w-full h-full rounded-xl shadow-lg"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-primary-600/50 dark:bg-primary-700/50 rounded-xl items-center justify-center">
                  <Text className="text-primary-300 dark:text-primary-400 text-xs">No Image</Text>
                </View>
              )}
            </View>
          </View>
        </BlurView>
      </ImageBackground>
    ) : (
      // Fallback when no backdrop is available
      <View className="w-full h-full bg-gradient-to-r from-primary-900 to-primary-800 dark:from-primary-950 dark:to-primary-900">
        <View className="flex-row h-full">
          {/* Same content structure as above but without blur */}
          <View className="flex-1 p-5 justify-between">
            <View>
              <Text className="text-primary-50 dark:text-primary-100 text-xl font-bold leading-tight mb-2" numberOfLines={2}>
                {title}
              </Text>
              <View className="flex-row items-center mb-3">
                <View className="flex-row items-center">
                  <Star size={14} color="#facc15" fill="#facc15" />
                  <Text className="ml-1 text-sm font-semibold text-primary-300 dark:text-primary-200">
                    {media.vote_average.toFixed(1)}
                  </Text>
                </View>
                {(media.release_date || media.first_air_date) && (
                  <Text className="ml-3 text-sm text-primary-300 dark:text-primary-400">
                    {new Date(media.release_date || media.first_air_date!).getFullYear()}
                  </Text>
                )}
              </View>
            </View>
            
            <View className="flex-row gap-x-3 mt-4">
              <TouchableOpacity
                className="flex-row items-center bg-primary-600 dark:bg-primary-700 px-4 py-2.5 rounded-full"
                onPress={onMarkWatched}
              >
                <Check size={16} color="white" />
                <Text className="ml-2 text-sm font-semibold text-primary-50 dark:text-primary-100">
                  Watched
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-row items-center border border-primary-400/30 dark:border-primary-300/30 bg-primary-100/10 dark:bg-primary-200/10 px-4 py-2.5 rounded-full"
                onPress={onAddToList}
              >
                <Plus size={16} color="white" />
                <Text className="ml-2 text-sm font-semibold text-primary-50 dark:text-primary-100">
                  Watchlist
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="w-32 h-full p-2">
            {posterUrl ? (
              <Image
                source={{ uri: posterUrl }}
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-primary-600 dark:bg-primary-700 rounded-xl items-center justify-center">
                <Text className="text-primary-400 dark:text-primary-500 text-xs">No Image</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )}
  </View>
);
}