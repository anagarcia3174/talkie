import { Media } from '~/types/supabaseTypes';
import { View, Text, Image } from 'react-native';
import { Star } from 'lucide-react-native';
import MediaOverview from './MediaOverview';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface MediaHeaderProps {
  media: Media;
  shrinkHeader: boolean;
}

export default function MediaHeader({ media, shrinkHeader }: MediaHeaderProps) {
  const year = media.release_date?.slice(0, 4);
  const rating = media.vote_average?.toFixed(1);

  const poster = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null;

  const shrinkProgress = useSharedValue(0);

  useEffect(() => {
    shrinkProgress.value = withTiming(shrinkHeader ? 1 : 0, {
      duration: 300,
    });
  }, [shrinkHeader]);

  const posterStyle = useAnimatedStyle(() => {
    const height = interpolate(shrinkProgress.value, [0, 1], [192, 96]);
    const width = interpolate(shrinkProgress.value, [0, 1], [132, 66]);

    return {
      height,
      width,
    };
  });

  const titleStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(shrinkProgress.value, [0, 1], [22, 16]);

    return {
      fontSize,
    };
  });

  const metaStyle = useAnimatedStyle(() => {
    const scale = interpolate(shrinkProgress.value, [0, 1], [1, 0.85]);

    return {
      transform: [{ scale }],
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {};
  });

  return (
    <Animated.View style={[containerStyle]} className="items-center px-4">
      {/* Poster */}
      {poster && (
        <Animated.Image
          source={{ uri: poster }}
          style={posterStyle}
          className="mb-2 rounded-xl"
          resizeMode="cover"
        />
      )}

      <Animated.Text
        style={titleStyle}
        className="text-center font-SpaceGrotesk-SemiBold text-primary-900 dark:text-primary-50"
      >
        {media.title}
      </Animated.Text>

      <Animated.View style={metaStyle} className="mb-2 flex-row items-center">
        {year && (
          <>
            <Text className="font-SpaceGrotesk-Medium text-lg text-primary-800 dark:text-primary-100">
              {year}
            </Text>
            <View className="mx-4 h-1 w-1 rounded-full bg-primary-700 dark:bg-primary-200" />
          </>
        )}
        <Star size={16} color="#fbbf24" fill="#fbbf24" />
        <Text className="ml-1 font-SpaceGrotesk-Medium text-lg text-primary-900 dark:text-primary-50">
          {rating}
        </Text>
      </Animated.View>

      {!shrinkHeader && (
        <MediaOverview synopsis={media.synopsis || 'No overview available.'} />
      )}
    </Animated.View>
  );
}
