import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ReviewWithProfile } from '~/types/supabaseTypes';
import { Star, Trash2, UserRound } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { getPublicUrl } from '~/utils/storageUrl';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

interface ReviewItemProps {
  review: ReviewWithProfile;
  isUser?: boolean;
}

export default function ReviewItem({ review, isUser }: ReviewItemProps) {
  const uri = getPublicUrl(review.avatar_url);
  const hasAvatar = uri && uri.length > 0;

  const renderRightActions = () => {
    if (!isUser) return null;

    return (
      <TouchableOpacity className="h-full w-24 items-center justify-center bg-red-500">
        <Trash2 size={24} color="white" />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <ReanimatedSwipeable
        enabled={isUser} // disable swipe for all other users
        rightThreshold={40}
        renderRightActions={renderRightActions}
        friction={3}
        overshootRight={false}>
        <View
          className={`flex-row items-center gap-3 border-b border-gray-200 p-4 dark:border-gray-700
    ${isUser && 'bg-primary-100/40 dark:bg-primary-950/40'}
    `}>
          {/* Avatar */}
          {hasAvatar ? (
            <Image source={{ uri }} className="h-10 w-10 rounded-full bg-gray-300" />
          ) : (
            <View className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
              <UserRound size={24} />
            </View>
          )}
          {/* Review content */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="font-semibold text-black dark:text-white">
                  {review.display_name}
                </Text>

                {isUser && (
                  <View className="ml-2 rounded-full bg-primary-600/20 px-2 py-0.5">
                    <Text className="text-[10px] font-semibold text-primary-700 dark:text-primary-200">
                      YOU
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center justify-center gap-x-1">
                <Text className="font-SpaceGrotesk-SemiBold text-xs text-primary-950 dark:text-primary-50">
                  {review.rating}/10
                </Text>
                <Star strokeWidth={1.5} size={14} color="gold" fill="gold" />
              </View>
            </View>

            {/* Review Content */}
            {review.content ? (
              <View className="relative mt-1">
                <Text className="text-sm text-gray-700 dark:text-gray-300">{review.content}</Text>
                <BlurView
                  intensity={0}
                  tint="light"
                  className="absolute inset-0"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
              </View>
            ) : (
              <Text className="mt-1 text-sm italic text-gray-500 dark:text-gray-400">
                No written review
              </Text>
            )}
          </View>
        </View>
      </ReanimatedSwipeable>
    </>
  );
}
