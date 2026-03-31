import { Media } from '~/types/supabaseTypes';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ImageOff, Star } from 'lucide-react-native';
import MediaOverview from './MediaOverview';
import { useTheme } from '~/hooks/useTheme';
import { haptics } from '~/utils/haptics';

interface MediaHeaderProps {
  media: Media;
  onPosterPress?: () => void;
}

export default function MediaHeader({ media, onPosterPress }: MediaHeaderProps) {
  const year = media.release_date?.slice(0, 4);
  const rating = media.vote_average?.toFixed(1);
  const theme = useTheme();
  const poster = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null;

  return (
    <View className="my-2">
      <View className="flex-row">
        {/* Poster */}
        {poster ? (
          <TouchableOpacity activeOpacity={0.9} onPress={() => {
            haptics.action();
            onPosterPress?.()}}>
            <Image
              source={{ uri: poster }}
              style={{ height: 144, width: 96 }}
              className="mr-4 rounded-xl"
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <View
            style={{ height: 144, width: 96 }}
            className="mr-4 items-center justify-center rounded-xl bg-primary-400 dark:bg-primary-800">
            <ImageOff size={36} color={theme.primary[700]} />
          </View>
        )}

        {/* Title + Meta + Synopsis all in one column */}
        <View className="flex-1 justify-center">
          <Text
            style={{ fontSize: 20 }}
            className="font-SpaceGrotesk-SemiBold text-primary-900 dark:text-primary-50">
            {media.title}
          </Text>

          <View className="mt-1 flex-row items-center">
            {year && (
              <>
                <Text className="font-SpaceGrotesk-Regular text-base text-primary-800 dark:text-primary-100">
                  {year}
                </Text>
                <View className="mx-3 h-1 w-1 rounded-full bg-primary-700 dark:bg-primary-200" />
              </>
            )}
            <Star
              size={13}
              color={theme.isDark ? 'gold' : 'yellow'}
              fill={theme.isDark ? 'gold' : 'yellow'}
            />
            <Text className="ml-1 font-SpaceGrotesk-Medium text-base text-primary-900 dark:text-primary-50">
              {rating}
            </Text>
          </View>

          <View className="mt-2">
            <MediaOverview synopsis={media.synopsis || 'No overview available.'} />
          </View>
        </View>
      </View>
    </View>
  );
}
