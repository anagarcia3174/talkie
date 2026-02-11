import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView } from 'react-native';
import StatsSection from '~/components/StatsSection';
import ProfileSection from '~/components/ProfileSection';
import { useProfile } from '~/store/profileStore';
import { useState } from 'react';
import { useAuth } from '~/context/AuthContext';
import ProfileActionsModal from '~/components/ProfileActionsModal';
import { Toast } from 'toastify-react-native';
import ErrorScreen from '~/components/ErrorScreen';

export default function Profile() {
  const { user } = useAuth();
  const { stats, profile, uploadAvatar, updateProfile } = useProfile();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const subtitle =
    user?.email ??
    (user?.created_at
      ? `Member since ${new Date(user.created_at).toLocaleDateString()}`
      : undefined);

  if (!profile) {
    return (
      <ErrorScreen
        title="Profile not found!"
        message="There was an error fetching your profile."
        fullScreen={false}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      <View className="mb-2 flex-row items-center justify-start px-4">
        <Text className="font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">
          Profile
        </Text>
      </View>
      <ScrollView className="px-4">
        <ProfileSection
          avatar={profile.avatar_url}
          displayName={profile.display_name}
          bio={profile.bio}
          subtitle={subtitle}
          editable
          onEditPress={() => setShowProfileModal(true)}
        />
        <StatsSection stats={stats} />
      </ScrollView>
      <ProfileActionsModal
        visible={showProfileModal}
        avatar={profile.avatar_url}
        displayName={profile.display_name}
        bio={profile.bio}
        onClose={() => setShowProfileModal(false)}
        onUpdateProfile={async (image, data) => {
          if (!user) return;
          Toast.show({
            type: 'info',
            text1: 'Updating Profile...',
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
            onPress: () => Toast.hide(),
          });
          try {
            if (image) {
              const res = await uploadAvatar(user.id, image);
              if (!res.success) {
                Toast.show({
                  type: 'error',
                  text1: res.error || 'Failed to update your profile',
                  position: 'top',
                  visibilityTime: 4000,
                  autoHide: true,
                  onPress: () => Toast.hide(),
                });
              }
            }
            if (data && Object.keys(data).length > 0) {
              const res = await updateProfile(user.id, data);
              if (!res.success) {
                Toast.show({
                  type: 'error',
                  text1: res.error || 'Failed to update your profile',
                  position: 'top',
                  visibilityTime: 4000,
                  autoHide: true,
                  onPress: () => Toast.hide(),
                });
              }
            }
            Toast.show({
              type: 'success',
              text1: 'Updated Profile!',
              position: 'top',
              visibilityTime: 3000,
              autoHide: true,
              onPress: () => Toast.hide(),
            });
          } catch (e: any) {
            Toast.show({
              type: 'error',
              text1: 'Failed to update your profile',
              position: 'top',
              visibilityTime: 4000,
              autoHide: true,
              onPress: () => Toast.hide(),
            });
          }
        }}
      />
    </SafeAreaView>
  );
}
