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
    <View className="overflow-hidden rounded-t-2xl  bg-primary-100 dark:bg-primary-900">
      {/* Title + overview | poster */}
      <View className="flex-row py-2 px-2">
        {poster ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              haptics.action();
              onPosterPress?.();
            }}>
            <Image
              source={{ uri: poster }}
              style={{ height: 144, width: 96 }}
              className="rounded-xl"
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <View
            style={{ height: 144, width: 96 }}
            className="items-center justify-center rounded-xl bg-primary-400 dark:bg-primary-800">
            <ImageOff size={36} color={theme.primary[700]} />
          </View>
        )}
        <View className="flex-1 pl-3">
          <Text
            style={{ fontSize: 20 }}
            className="font-SpaceGrotesk-SemiBold text-primary-900 dark:text-primary-50">
            {media.title}
          </Text>
          <View className="">
            <MediaOverview synopsis={media.synopsis || 'No overview available.'} />
          </View>
        </View>

        
      </View>

      {/* Divider */}
      <View className="mx-2 border-t border-primary-200 dark:border-primary-800" />

      {/* Stats row */}
      <View className="flex-row">
        <View className="flex-1 items-center p-3">
          <Text className="font-SpaceGrotesk-Bold text-lg text-primary-900 dark:text-primary-100">
            {year ?? '—'}
          </Text>
          <Text className="text-sm text-primary-600 dark:text-primary-400">released</Text>
        </View>

        <View className="my-2 border-l border-primary-200 dark:border-primary-800" />

        <View className="flex-1 items-center p-3">
          <View className="flex-row items-center gap-x-1 py-0.5">
            <Star size={13} color={theme.isDark ? 'gold' : 'goldenrod'} fill={theme.isDark ? 'gold' : 'goldenrod'} />
            <Text className="font-SpaceGrotesk-Bold text-lg text-primary-900 dark:text-primary-100">
              {rating ?? '—'}
            </Text>
          </View>
          <Text className="text-sm text-primary-600 dark:text-primary-400">rating</Text>
        </View>

        <View className="my-2 border-l border-primary-200 dark:border-primary-800" />

        <View className="flex-1 items-center p-3">
          <Text className="font-SpaceGrotesk-Bold text-lg text-primary-900 dark:text-primary-100">
            {media.comment_count}
          </Text>
          <Text className="text-sm text-primary-600 dark:text-primary-400">comments</Text>
        </View>
      </View>
      <View className="mx-2 border-t border-primary-200 dark:border-primary-800" />

    </View>
  );
}
