import { View, Text, Image, Pressable, TouchableOpacity } from 'react-native';
import { UserRound } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';

interface ProfileSectionProps {
  avatar: string | null;
  displayName: string;
  bio: string | null;
  subtitle?: string;
  onAvatarPress?: () => void;
}

export default function ProfileSection({
  avatar,
  displayName,
  bio,
  subtitle,
  onAvatarPress
}: ProfileSectionProps) {
  const theme = useTheme();

  return (
    <View className="mb-6 mt-2 rounded-lg bg-primary-200 p-3 dark:bg-primary-900">
        <View className="mb-4 flex-row items-center">
          {avatar ? (
            <TouchableOpacity activeOpacity={0.9} onPress={() => onAvatarPress?.()}>
              <Image source={{ uri: avatar }} className="h-16 w-16 rounded-full" />
            </TouchableOpacity>
          ) : (
            <View className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
              <UserRound size={32} color={theme.primary[900]} />
            </View>
          )}

          <View className="ml-4 flex-1">
            <Text className="font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
              {displayName || 'New User'}
            </Text>
            {subtitle && (
              <Text className="font-SpaceGrotesk-Regular text-sm text-primary-700 dark:text-primary-300">
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View>
          <Text className="text-md font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50">
            Bio
          </Text>
          <Text className="font-SpaceGrotesk-Regular text-sm text-primary-950 dark:text-primary-50">
            {bio || 'No bio yet'}
          </Text>
        </View>
    </View>
  );
}
