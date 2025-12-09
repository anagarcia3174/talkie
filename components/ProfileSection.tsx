import { View, Text, Image, Pressable } from 'react-native';
import { UserRound } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import ProfileActionsModal from '~/components/ProfileActionsModal';
import { useState } from 'react';
import { ImagePickerAsset } from 'expo-image-picker';
import { useAuth } from '~/context/AuthContext';
import { useProfile } from '~/store/profileStore';

export default function ProfileSection() {
  const { user } = useAuth();
  const { profile, uploadAvatar, updateProfile } = useProfile();
  const theme = useTheme();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : '';
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <View className="mb-6 mt-2 rounded-lg bg-primary-200 p-3 dark:bg-primary-900">
      <Pressable onPress={() => setShowProfileModal(true)}>
        <View className="mb-4 flex-row items-center">
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <View className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
              <UserRound size={32} color={theme.primary[900]} />
            </View>
          )}
          <View className="ml-4 flex-1">
            <Text className="font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
              {profile?.display_name || 'New User'}
            </Text>
            <Text className="font-SpaceGrotesk-Regular text-sm text-primary-700 dark:text-primary-300">
              {user?.email ?? `Member since ${memberSince}`}
            </Text>
          </View>
        </View>
        <View>
          <Text className="text-md font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50">
            Bio
          </Text>
          <Text className="font-SpaceGrotesk-Regular text-sm text-primary-950 dark:text-primary-50">
            {profile?.bio ?? 'No bio yet'}
          </Text>
        </View>
      </Pressable>

      <ProfileActionsModal
        visible={showProfileModal}
        avatar={profile?.avatar_url}
        displayName={profile?.display_name}
        bio={profile?.bio}
        onClose={() => setShowProfileModal(false)}
        onUploadPicture={async (image: ImagePickerAsset) => {
          const res = await uploadAvatar(user!.id, image);
          if (res.success) setShowProfileModal(false);
          else alert(res.error);
        }}
        onUpdateProfile={async (updates) => {
          if (!user) return;
          const res = await updateProfile(user.id, updates);
          if (res.success) setShowProfileModal(false);
          else alert(res.error);
        }}
      />
    </View>
  );
}
