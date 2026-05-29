import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import LoadingScreen from '~/components/LoadingScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import ProfileSection from '~/components/ProfileSection';
import ErrorScreen from '~/components/ErrorScreen';
import StatsSection from '~/components/StatsSection';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { ChevronLeft, Heart, X } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useList } from '~/store/listStore';
import FollowButton from '~/components/FollowButton';
import { useBlock } from '~/store/blockStore';
import { useFollow } from '~/store/followStore';
import { useComment } from '~/store/commentStore';
import { useReview } from '~/store/reviewStore';
import { useAuth } from '~/context/AuthContext';
import Toast from 'react-native-toast-message';
import { useProfile } from '~/store/profileStore';
import { haptics } from '~/utils/haptics';
import ConfirmModal from '~/components/ConfirmModal';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const { otherProfiles, fetchOtherProfile } = useProfile();
  const profileState = otherProfiles[id];
  const profile = profileState?.profile ?? null;
  const profileStats = profileState?.stats ?? null;
  const profileLists = profileState?.lists ?? [];

  const loading = profileState?.loading ?? false;
  const error = profileState?.error ?? null;

  const [blocking, setBlocking] = useState(false);
  const [confirmBlockVisible, setConfirmBlockVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { cacheList } = useList();
  const { block, blockedIds } = useBlock();
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (!id) return;

    fetchOtherProfile(id);
  }, [id, fetchOtherProfile]);

  useEffect(() => {
    if (!profile) return;

    if (blockedIds.has(profile.id)) {
      router.dismissAll();
      router.replace('/(protected)/(tabs)/Home');
    }
  }, [blockedIds, profile, router]);

  if (loading && !profile) {
    return <LoadingScreen fullScreen />;
  }

  if (error || !profile) {
    return (
      <ErrorScreen
        title="Profile not found!"
        fullScreen
        message={error || 'There was an error fetching the profile you requested.'}
        onRetry={() => fetchOtherProfile(id)}
      />
    );
  }

  const handleBlock = async () => {
    if (!user) return;
    setBlocking(true);
    const result = await block(profile.id, profile);
    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to block the user.',
        visibilityTime: 4000,
        autoHide: true,
      });
      setBlocking(false);
      return;
    }

    const { wasFollowing, wasFollower } = useFollow.getState().purgeUserContent(profile.id);
    useComment.getState().purgeUserContent(profile.id);
    useReview.getState().purgeUserContent(profile.id);
    useList.getState().purgeUserContent(profile.id);
    useProfile.getState().purgeUserContent(profile.id);
    if (wasFollowing) useProfile.getState().adjustProfileStats({ following: -1 });
    if (wasFollower) useProfile.getState().adjustProfileStats({ followers: -1 });

    setBlocking(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      <View className="mb-2 flex-row items-center justify-between px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          className="rounded-md   bg-primary-100 p-1  dark:bg-primary-900">
          <ChevronLeft color={theme.primary[950]} size={20} strokeWidth={2} />
        </TouchableOpacity>
        <Text className="font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
          Profile
        </Text>
        <View className="w-7"></View>
      </View>

      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        <ProfileSection
          avatar={profile.avatar_url}
          displayName={profile.display_name}
          bio={profile.bio}
          subtitle={`Member since ${new Date(profile.created_at).toLocaleDateString()}`}
          onAvatarPress={() => {
            setPreviewImage(profile.avatar_url);
          }}
          followButton={<FollowButton targetUserId={profile.id} targetProfile={profile} />}
        />
        {profileStats && <StatsSection stats={profileStats} />}
        <Text className="mb-2 font-SpaceGrotesk-Medium text-sm uppercase tracking-wide text-primary-500 dark:text-primary-400">
          Lists
        </Text>
        <FlatList
          data={profileLists}
          scrollEnabled={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                cacheList({
                  ...item,
                  owner: {
                    id: profile.id,
                    display_name: profile.display_name,
                    avatar_url: profile.avatar_url,
                    is_private: profile.is_private,
                  },
                });
                router.push({
                  pathname: '/list/[id]',
                  params: {
                    id: item.id,
                  },
                });
              }}
              activeOpacity={0.85}
              className="overflow-hidden rounded-xl bg-primary-100 dark:bg-primary-900">
              <View className="px-4 pb-3 pt-4">
                <View className="flex-row items-start gap-3">
                  <View className="min-w-0 flex-1">
                    <Text className="font-SpaceGrotesk-SemiBold text-xl leading-6 text-primary-950 dark:text-primary-50">
                      {item.name}
                    </Text>
                    {!!item.description && (
                      <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        className="mt-2 font-SpaceGrotesk-Light text-base leading-5 text-primary-600 dark:text-primary-400">
                        {item.description}
                      </Text>
                    )}
                  </View>
                  <View className="shrink-0 flex-row items-center gap-x-1 pt-0.5">
                    <Text className="font-SpaceGrotesk-Light text-sm text-primary-700 dark:text-primary-300">
                      {item.like_count}
                    </Text>
                    <Heart
                      size={14}
                      color={theme.primary[700]}
                      fill={item.is_liked ? theme.primary[700] : theme.primary[100]}
                    />
                  </View>
                </View>
              </View>

              {/* Footer: item count badge */}
              <View className="flex-row items-center justify-end px-4 pb-4 pt-3">
                <View className="shrink-0 rounded-lg bg-primary-200 px-2 py-1 dark:bg-primary-800">
                  <Text className="font-SpaceGrotesk-Light text-sm text-primary-700 dark:text-primary-400">
                    {item.item_count} {item.item_count === 1 ? 'Item' : 'Items'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
        <View className="items-center pt-6">
          <TouchableOpacity
            disabled={blocking}
            onPress={() => {
              haptics.warning();
              setConfirmBlockVisible(true);
            }}
            className="rounded-lg border border-red-400 bg-red-500/20 px-6 py-2 dark:border-red-500 dark:bg-red-400/25">
            <Text className="font-SpaceGrotesk-Medium text-sm text-red-400 dark:text-red-500">
              {blocking ? 'Blocking...' : 'Block User'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ConfirmModal
        visible={confirmBlockVisible}
        onCancel={() => setConfirmBlockVisible(false)}
        onConfirm={() => {
          setConfirmBlockVisible(false);
          handleBlock();
        }}
        variant="danger"
        title="Block User"
        message="Are you sure you want to block this user?"
        cancelLabel="Cancel"
        confirmLabel="Block"
      />
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-primary-100 px-4 dark:bg-primary-950">
          <TouchableOpacity
            onPress={() => setPreviewImage(null)}
            hitSlop={10}
            className="absolute left-6 top-16 z-10 py-2">
            <X size={28} color={theme.primary[900]} />
          </TouchableOpacity>

          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              resizeMode="contain"
              style={{
                width: '100%', // take full width of modal minus padding
                maxWidth: 400, // don't get too huge on tablets
                aspectRatio: 1, // keep it square
                maxHeight: '90%', // allow it to scale with screen height
              }}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
