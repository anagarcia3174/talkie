import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Clock,
  Star,
  Film,
  Users,
  MessageSquareText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { ProfileStats } from '~/types/supabaseTypes';
import { useTheme } from '~/hooks/useTheme';



export default function StatsSection({stats}: {stats: ProfileStats}) {
  const [showMore, setShowMore] = useState(false);
    const theme= useTheme();
  return (
    <View className="mb-8">
      <Text className="mb-2 font-SpaceGrotesk-Regular text-lg text-primary-950 dark:text-primary-50">
        Stats
      </Text>

      {/* Main Stats */}
      <View className="flex-row justify-between">
        <View className="mx-1 flex-1 items-center rounded-lg bg-primary-200 p-4 dark:bg-primary-900">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-300 dark:bg-primary-700">
            <Text className="font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50">
              {stats.totalLogged}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center">
            <Film size={16} color={theme.primary[600]} />
            <Text className="ml-1 text-xs text-primary-700 dark:text-primary-300">Logged</Text>
          </View>
        </View>

        <View className="mx-1 flex-1 items-center rounded-lg bg-primary-200 p-4 dark:bg-primary-900">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-300 dark:bg-primary-700">
            <Text className="font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50">
              {stats.avgRating.toFixed(1)}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center">
            <Star size={16} color={theme.primary[600]} />
            <Text className="ml-1 text-xs text-primary-700 dark:text-primary-300">Avg Rating</Text>
          </View>
        </View>

        
        <View className="mx-1 flex-1 items-center rounded-lg bg-primary-200 p-4 dark:bg-primary-900">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-300 dark:bg-primary-700">
            <Text className="font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50">
              {stats.reviews}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center">
            <MessageSquareText size={16} color={theme.primary[600]} />
            <Text className="ml-1 text-xs text-primary-700 dark:text-primary-300">Reviews</Text>
          </View>
        </View>
      </View>
{showMore && (
        <View className="mt-3 flex-row justify-between">
          <View className="mx-1 flex-1 items-center rounded-lg bg-primary-200 p-4 dark:bg-primary-900">
            <Text className="font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50">
              {stats.followers}
            </Text>
            <View className="mt-1 flex-row items-center">
              <Users size={16} color={theme.primary[600]} />
              <Text className="ml-1 text-xs text-primary-700 dark:text-primary-300">Followers</Text>
            </View>
          </View>

          <View className="mx-1 flex-1 items-center rounded-lg bg-primary-200 p-4 dark:bg-primary-900">
            <Text className="font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50">
              {stats.following}
            </Text>
            <View className="mt-1 flex-row items-center">
              <Users size={16} color={theme.primary[600]} />
              <Text className="ml-1 text-xs text-primary-700 dark:text-primary-300">Following</Text>
            </View>
          </View>

         
        </View>
      )}
      {/* Toggle Button */}
      <Pressable
        className="mt-3 flex-row items-center justify-center"
        onPress={() => setShowMore(!showMore)}>
        <Text className="mr-1 text-sm text-primary-700 dark:text-primary-300">
          {showMore ? 'Show Less' : 'Show More'}
        </Text>
        {showMore ? (
          <ChevronUp size={16} color={theme.primary[600]} />
        ) : (
          <ChevronDown size={16} color={theme.primary[600]} />
        )}
      </Pressable>

      {/* Extra Stats */}
      
    </View>
  );
}
