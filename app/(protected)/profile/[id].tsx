import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import LoadingScreen from '~/components/LoadingScreen';
import { getProfileById, getProfileStats } from '~/services/profileService';
import { Profile, ProfileStats } from '~/types/supabaseTypes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TouchableOpacity, View } from 'react-native';
import ProfileSection from '~/components/ProfileSection';
import ErrorScreen from '~/components/ErrorScreen';
import StatsSection from '~/components/StatsSection';
import { ScrollView } from 'react-native-gesture-handler';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
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

        setProfile(profileRes.data);
        setProfileStats(statsRes.data);
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
        />
        {profileStats && <StatsSection stats={profileStats} />}
      </ScrollView>
    </SafeAreaView>
  );
}
