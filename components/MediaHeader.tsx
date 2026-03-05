import { Media } from '~/types/supabaseTypes';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ImageOff, Star } from 'lucide-react-native';
import MediaOverview from './MediaOverview';
import { useTheme } from '~/hooks/useTheme';

interface MediaHeaderProps {
  media: Media;
  shrinkHeader: boolean;
  onPosterPress?: () => void;
}

export default function MediaHeader({ media, shrinkHeader, onPosterPress }: MediaHeaderProps) {
  const year = media.release_date?.slice(0, 4);
  const rating = media.vote_average?.toFixed(1);
  const theme = useTheme();
  const poster = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null;

  const posterHeight = shrinkHeader ? 96 : 192;
  const posterWidth = shrinkHeader ? 66 : 132;
  const titleSize = shrinkHeader ? 18 : 22;

  if (shrinkHeader) {
    return (
      <View className="my-2 items-start">
        <View className="flex-row items-start">
          {/* Poster */}
          {poster ? (
            <TouchableOpacity activeOpacity={0.9} onPress={() => onPosterPress?.()}>
              <Image
                source={{ uri: poster }}
                style={{ height: posterHeight, width: posterWidth }}
                className="mr-4 rounded-xl"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <View
              style={{ height: posterHeight, width: posterWidth }}
              className="mr-4 items-center justify-center rounded-xl bg-primary-400 dark:bg-primary-800">
              <ImageOff size={32} color={theme.primary[700]} />
            </View>
          )}

          {/* Title + Meta */}
          <View>
            <Text
              style={{ fontSize: titleSize }}
              className="font-SpaceGrotesk-SemiBold text-primary-900 dark:text-primary-50">
              {media.title}
            </Text>

            <View className="flex-row items-center">
              {year && (
                <>
                  <Text className="text-md font-SpaceGrotesk-Regular text-primary-800 dark:text-primary-100">
                    {year}
                  </Text>
                  <View className="mx-3 h-1 w-1 rounded-full bg-primary-700 dark:bg-primary-200" />
                </>
              )}
              <Star size={12} color="#fbbf24" fill="#fbbf24" />
              <Text className="text-md ml-1 font-SpaceGrotesk-Medium text-primary-900 dark:text-primary-50">
                {rating}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  } else {
    return (
      <View className="items-center">
        {/* Poster */}
        {poster ? (
          <TouchableOpacity activeOpacity={0.9} onPress={() => onPosterPress?.()}>
            <Image
              source={{ uri: poster }}
              style={{ height: posterHeight, width: posterWidth }}
              className="mb-1 rounded-xl"
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <View
            style={{ height: posterHeight, width: posterWidth }}
            className="mb-2 items-center justify-center rounded-xl bg-primary-400 dark:bg-primary-800">
            <ImageOff size={48} color={theme.primary[700]} />
          </View>
        )}

        <Text
          style={{ fontSize: titleSize }}
          className="text-center font-SpaceGrotesk-SemiBold text-primary-900 dark:text-primary-50">
          {media.title}
        </Text>

        <View className="mb-2 flex-row items-center">
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
        </View>
        <MediaOverview synopsis={media.synopsis || 'No overview available.'} />
      </View>
    );
  }
}
