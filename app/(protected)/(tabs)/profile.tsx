import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import StatsSection from '~/components/StatsSection';
import ProfileSection from '~/components/ProfileSection';
import { useProfile } from '~/store/profileStore';
import { useState } from 'react';
import { useAuth } from '~/context/AuthContext';
import ProfileActionsModal from '~/components/ProfileActionsModal';
import Toast from 'react-native-toast-message';
import { MoreVertical } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import SignOutModal from '~/components/SignOutModal';
import DeleteAccountModal from '~/components/DeleteAccountModal';
import AccountOverlay from '~/components/AccountOverlay';
import BlockedUsersModal from '~/components/BlockedUsersModal';
import FollowsModal from '~/components/FollowsModal';
import { haptics } from '~/utils/haptics';
import BugReportModal from '~/components/BugReportModal';
import { CreateBugReportInput, CreateFeedbackInput } from '~/types/supabaseTypes';
import { createBugReport } from '~/services/bugService';
import FeedbackModal from '~/components/FeedbackModal';
import { createFeedback } from '~/services/feedbackService';

export default function Profile() {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const { stats, profile, uploadAvatar, updateProfile, deleteAccount } = useProfile();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [signOutModal, setSignOutModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [blockedModal, setBlockedModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [followModal, setFollowModal] = useState<null | 'followers' | 'following'>(null);
  const [followModalVisible, setFollowModalVisible] = useState(false);
  const [reportBugModalVisible, setReportBugModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
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
      haptics.error();
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
      haptics.error();

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
      haptics.error();

      Toast.show({
        type: 'error',
        text1: 'Failed to sign you out.',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  const handleBugReport = async (bug: CreateBugReportInput) => {
    setReportBugModalVisible(false);
    const result = await createBugReport(bug);

    if (!result.success) {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: result.error || 'There was an error submitting your bug report.',
        visibilityTime: 4000,
        autoHide: true,
      });
    } else {
      haptics.success();
      Toast.show({
        type: 'success',
        text1: 'Bug report submitted! Thanks for helping us improve Noat.',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  const handleFeedbackSubmit = async (feedback: CreateFeedbackInput) => {
    setReportBugModalVisible(false);
    const result = await createFeedback(feedback);

    if (!result.success) {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: result.error || 'There was an error submitting your feedback.',
        visibilityTime: 4000,
        autoHide: true,
      });
    } else {
      haptics.success();
      Toast.show({
        type: 'success',
        text1: 'Feedback submitted! Thanks for helping us improve Noat.',
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
          className="p-2"
          onPress={() => {
            haptics.action();
            setOverlayVisible(true);
          }}>
          <MoreVertical size={24} color={theme.primary[950]} />
        </TouchableOpacity>
      </View>
      <ScrollView className="px-4">
        <ProfileSection
          avatar={profile.avatar_url}
          displayName={profile.display_name}
          bio={profile.bio}
          subtitle={subtitle}
        />
        <StatsSection
          stats={stats}
          onTilePress={(tile) => {
            if (tile === 'followers') {
              haptics.action();
              setFollowModal('followers');
              setFollowModalVisible(true);
            } else if (tile === 'following') {
              haptics.action();
              setFollowModal('following');
              setFollowModalVisible(true);
            }
          }}
        />
      </ScrollView>
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
                haptics.error();
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
                haptics.error();
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
            haptics.success();
            Toast.show({
              type: 'success',
              text1: 'Updated Profile!',
              position: 'top',
              visibilityTime: 3000,
            });
          } catch (e: any) {
            Toast.hide();
            haptics.error();
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
      <BlockedUsersModal visible={blockedModal} onClose={() => setBlockedModal(false)} />
      <FollowsModal
        visible={followModalVisible}
        onClose={() => setFollowModalVisible(false)}
        checking={followModal ?? 'followers'}
      />
      <BugReportModal
        visible={reportBugModalVisible}
        onClose={() => setReportBugModalVisible(false)}
        onSubmit={handleBugReport}
      />
      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={() => {
          setFeedbackModalVisible(false);
        }}
        onSubmit={handleFeedbackSubmit}
      />
      <AccountOverlay
        visible={overlayVisible}
        onClose={() => setOverlayVisible(false)}
        onSubmit={(operation) => {
          if (operation === 'edit_profile' && !updateLoading && !deleting) {
            setOverlayVisible(false);
            setShowProfileModal(true);
          } else if (operation === 'blocked_users') {
            setOverlayVisible(false);
            setBlockedModal(true);
          } else if (operation === 'sign_out' && !updateLoading) {
            setOverlayVisible(false);
            setSignOutModal(true);
          } else if (operation === 'delete_account' && !updateLoading) {
            setOverlayVisible(false);
            setDeleteAccountModal(true);
          } else if (operation === 'bug_report') {
            setOverlayVisible(false);
            setReportBugModalVisible(true);
          } else if (operation === 'feedback') {
            setOverlayVisible(false);
            setFeedbackModalVisible(true);
          } else {
            setOverlayVisible(false);
          }
        }}
      />
    </SafeAreaView>
  );
}
