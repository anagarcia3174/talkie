import {
  View,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  Image,
  Text,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Star } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useEffect, useState } from 'react';
import { Media, ReviewWithProfile } from '~/types/supabaseTypes';
import ListSelectionModal from '~/components/ListSelectionModal';
import { useAuth } from '~/context/AuthContext';
import ReviewItem from '~/components/ReviewItem';
import AddReviewForm from '~/components/AddReviewForm';
import { useReviews } from '~/store/reviewStore';
import { Toast } from 'toastify-react-native';
import MediaTabs from '~/components/MediaTabs';
import MediaHeader from '~/components/MediaHeader';

const CONTENT_OPTIONS = ['Reviews', 'Comments'];

export default function MediaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id: string; mediaData: string }>();
  const media: Media = JSON.parse(params.mediaData as string);
  const theme = useTheme();
  const [selectedSegment, setSelectedSegment] = useState(0);
  const [listModalVisible, setListModalVisible] = useState(false);
  const backdrop = media.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${media.backdrop_path}`
    : null;
  const poster = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null;
  const [shrinkHeader, setShrinkHeader] = useState(false);
  const { submitReview, fetchReviewsForMedia } = useReviews();
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const userReview = reviews.find((r) => r.user_id === user?.id);
  const otherReviews = reviews.filter((r) => r.user_id !== user?.id);

  const sortedReviews = userReview ? [userReview, ...otherReviews] : reviews;
  const hasReviewed = !!userReview;

  const loadReviews = async () => {
    setLoadingReviews(true);
    const result = await fetchReviewsForMedia(media.id);
    if (result.success) {
      setReviews(result.data || []);
    }
    setLoadingReviews(false);
  };

  useEffect(() => {
    loadReviews();
  }, [media.id]);

  const handleSubmitReview = async (rating: number, content: string) => {
    if (user?.id) {
      const result = await submitReview({
        rating,
        content,
        user_id: user.id,
        media_id: media.id,
      });

      if (result.success) {
        await loadReviews();

        Toast.show({
          type: 'success',
          text1: 'Review Posted!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          onPress: () => Toast.hide(),
        });
      } else {
        Toast.show({
          type: 'error',
          text1: result.error || 'Failed to post your review',
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => Toast.hide(),
        });
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'An unexpected error ocurred while posting your review',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    }
  };

  return (
    <View className="flex-1 bg-primary-50 dark:bg-primary-950">
      <ImageBackground
        source={{ uri: backdrop || poster || '' }}
        resizeMode="cover"
        className="h-full w-full">
        <BlurView
          intensity={theme.isDark ? 90 : 80}
          tint={theme.isDark ? 'systemThickMaterialDark' : 'systemThickMaterialLight'}
          className="flex-1 bg-primary-50/30 dark:bg-primary-950/40">
          <SafeAreaView className="flex-1" edges={['top']}>
            {/* Header Buttons */}
            <View className="flex-row justify-between px-4 ">
              <TouchableOpacity
                className="rounded-full bg-primary-900/40 p-2 dark:bg-primary-100/40"
                onPress={() => router.back()}>
                <ArrowLeft className="text-primary-50 dark:text-primary-950" size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setListModalVisible(true)}
                className="rounded-full bg-primary-900/40 p-2 dark:bg-primary-100/40">
                <Plus className="text-primary-50 dark:text-primary-950" size={24} />
              </TouchableOpacity>
            </View>
            <View className="flex-1 px-4">
              <MediaHeader media={media} shrinkHeader={shrinkHeader} />
              <MediaTabs
                selectedIndex={selectedSegment}
                onChange={setSelectedSegment}
                options={CONTENT_OPTIONS}
              />
              {selectedSegment === 0 &&
                (loadingReviews ? (
                  <ActivityIndicator
                    className="flex-1 items-center justify-center"
                    color={theme.primary[950]}
                  />
                ) : (
                  <FlatList
                    data={sortedReviews}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 8 }}
                    renderItem={({ item }) => (
                      <ReviewItem review={item} isUser={userReview && userReview.id === item.id} />
                    )}
                    onScroll={(e) => {
                      const y = e.nativeEvent.contentOffset.y;
                      setShrinkHeader(y > 30);
                    }}
                    scrollEventThrottle={16}
                  />
                ))}
            </View>
            {!hasReviewed && <AddReviewForm onSubmitReview={handleSubmitReview} />}
            <ListSelectionModal
              visible={listModalVisible}
              onClose={() => setListModalVisible(false)}
              mediaId={media.id}
              userId={user?.id}
            />
          </SafeAreaView>
        </BlurView>
      </ImageBackground>
    </View>
  );
}
