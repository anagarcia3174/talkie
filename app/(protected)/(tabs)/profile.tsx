import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import StatsSection from '~/components/StatsSection';
import ProfileSection from '~/components/ProfileSection';
import { useProfile } from '~/store/profileStore';
import { useState } from 'react';
import { useAuth } from '~/context/AuthContext';
import ProfileActionsModal from '~/components/ProfileActionsModal';
import Toast from 'react-native-toast-message';
import { LogOut } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import SignOutModal from '~/components/SignOutModal';
import DeleteAccountModal from '~/components/DeleteAccountModal';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { stats, profile, uploadAvatar, updateProfile, deleteAccount } = useProfile();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [signOutModal, setSignOutModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const theme = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const subtitle =
    user?.email ??
    (user?.created_at
      ? `Member since ${new Date(user.created_at).toLocaleDateString()}`
      : undefined);

  if (!profile) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to sign you out.',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleting) return;

    setDeleting(true);

    const result = await deleteAccount();

    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: result.error || 'There was an error deleting your account.',
        visibilityTime: 4000,
        autoHide: true,
      });
      setDeleting(false);
      return;
    }

    try {
      await signOut();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to sign you out.',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      <View className="mb-2 flex-row items-center justify-between px-4">
        <Text className="font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">
          Profile
        </Text>
        <TouchableOpacity
          disabled={!user || updateLoading || deleting}
          onPress={() => setSignOutModal(true)}>
          <LogOut color={theme.primary[900]} strokeWidth={1.5} size={24} />
        </TouchableOpacity>
      </View>
      <ScrollView className="px-4">
        <ProfileSection
          avatar={profile.avatar_url}
          displayName={profile.display_name}
          bio={profile.bio}
          subtitle={subtitle}
          editable={!updateLoading && !deleting}
          onEditPress={() => setShowProfileModal(true)}
        />
        <StatsSection stats={stats} />
      </ScrollView>
      <View style={{ paddingBottom: tabBarHeight }}>
        <TouchableOpacity
          disabled={updateLoading || deleting}
          onPress={() => setDeleteAccountModal(true)}>
          <Text className="text-center font-SpaceGrotesk-Regular text-sm text-primary-400 underline dark:text-primary-600">
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>
      <ProfileActionsModal
        visible={showProfileModal}
        avatar={profile.avatar_url}
        displayName={profile.display_name}
        bio={profile.bio}
        isPrivate={profile.is_private}
        onClose={() => setShowProfileModal(false)}
        onUpdateProfile={async (image, data) => {
          if (!user || deleting || updateLoading) return;
          setUpdateLoading(true);
          Toast.show({
            type: 'info',
            text1: 'Updating Profile...',
            position: 'top',
            autoHide: false,
            onPress: () => Toast.hide(),
          });
          try {
            if (image) {
              const res = await uploadAvatar(user.id, image);
              if (!res.success) {
                Toast.hide();
                Toast.show({
                  type: 'error',
                  text1: res.error || 'Failed to update your profile',
                  position: 'top',
                  visibilityTime: 4000,
                  onPress: () => Toast.hide(),
                });
                return;
              }
            }
            if (data && Object.keys(data).length > 0) {
              const res = await updateProfile(user.id, data);
              if (!res.success) {
                Toast.hide();
                Toast.show({
                  type: 'error',
                  text1: res.error || 'Failed to update your profile',
                  position: 'top',
                  visibilityTime: 4000,
                  onPress: () => Toast.hide(),
                });
                return;
              }
            }
            Toast.hide();
            Toast.show({
              type: 'success',
              text1: 'Updated Profile!',
              position: 'top',
              visibilityTime: 3000,
            });
          } catch (e: any) {
            Toast.hide();
            Toast.show({
              type: 'error',
              text1: 'Failed to update your profile',
              position: 'top',
              visibilityTime: 4000,
              onPress: () => Toast.hide(),
            });
          } finally {
            setUpdateLoading(false);
          }
        }}
      />
      <SignOutModal
        visible={signOutModal}
        onClose={(shouldSignOut) => {
          setSignOutModal(false);
          if (shouldSignOut) handleSignOut();
        }}
      />
      <DeleteAccountModal
        visible={deleteAccountModal}
        onClose={(shouldDeleteAccount) => {
          setDeleteAccountModal(false);
          if (shouldDeleteAccount) {
            handleDeleteAccount();
          }
        }}
        email={user?.email || profile.display_name}
      />
    </SafeAreaView>
  );
}
