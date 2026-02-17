import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import LoadingScreen from '~/components/LoadingScreen';
import { getProfileById, getProfileStats } from '~/services/profileService';
import { ListWithMeta, Profile, ProfileStats } from '~/types/supabaseTypes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import ProfileSection from '~/components/ProfileSection';
import ErrorScreen from '~/components/ErrorScreen';
import StatsSection from '~/components/StatsSection';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { Bookmark, ChevronLeft, X } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { getPublicListsByUserId } from '~/services/listService';
import { useLists } from '~/store/listStore';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [profileLists, setProfileLists] = useState<ListWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { addListToState } = useLists();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const profileRes = await getProfileById(id);
        if (!mounted) return;
        if (!profileRes.success) return;

        const statsRes = await getProfileStats(id);
        if (!mounted) return;
        if (!statsRes.success) return;

        const listsRes = await getPublicListsByUserId(id);
        if (!mounted) return;
        if (!listsRes.success) return;

        setProfile(profileRes.data);
        setProfileStats(statsRes.data);
        setProfileLists(listsRes.data);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return <LoadingScreen fullScreen />;
  }

  if (!profile) {
    return (
      <ErrorScreen
        title="Profile not found!"
        fullScreen
        message="There was an error fetching the profile you requests."
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      <View className="relative flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color={theme.primary[950]} size={24} />
        </TouchableOpacity>
        <Text
          pointerEvents="none"
          className="absolute left-0 right-0 text-center font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
          Profile
        </Text>
      </View>
      <ScrollView className="px-4">
        <ProfileSection
          avatar={profile.avatar_url}
          displayName={profile.display_name}
          bio={profile.bio}
          subtitle={`Member since ${new Date(profile.created_at).toLocaleDateString()}`}
          onAvatarPress={() => {
            setPreviewImage(profile.avatar_url);
          }}
        />
        {profileStats && <StatsSection stats={profileStats} />}
        <Text className="mb-2 font-SpaceGrotesk-Regular text-lg text-primary-950 dark:text-primary-50">
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
                addListToState({
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
              className="rounded-xl bg-primary-100 p-4 dark:bg-primary-900">
              {/* Top: title + likes */}
              <View className="flex-row items-start justify-between">
                <View className="mr-3 flex-1">
                  <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
                    {item.name}
                  </Text>

                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="mt-1 font-SpaceGrotesk-Light text-primary-600 dark:text-primary-400">
                    {item.description || 'No description'}
                  </Text>
                </View>

                {/* Likes on top right */}
                <View className="flex-row items-center justify-start gap-x-1">
                  <Text className="font-SpaceGrotesk-Light text-sm text-primary-700 dark:text-primary-300">
                    {item.likes_count}
                  </Text>
                  <Bookmark
                    size={12}
                    color={theme.primary[700]}
                    fill={item.is_liked ? theme.primary[700] : theme.primary[100]}
                  />
                </View>
              </View>

              {/* Bottom row: user left, item count right */}
              <View className="mt-1 flex-row items-center justify-end">
                <Text className="font-SpaceGrotesk-Light text-sm text-primary-700 dark:text-primary-300">
                  {item.item_count} {item.item_count === 1 ? 'Item' : 'Items'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-primary-950 px-4">
          <TouchableOpacity
            onPress={() => setPreviewImage(null)}
            className="absolute left-6 top-16 z-10">
            <X size={28} color="white" />
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
