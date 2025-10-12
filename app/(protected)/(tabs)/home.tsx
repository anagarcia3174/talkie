import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '~/components/Header';
import TrendingSection from '~/components/TrendingSection';
import { useHomeStore } from '~/store/homeStore';
import { ScrollView, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import MediaRowSection from '~/components/MediaRowSection';
import { useEffect } from 'react';


export default function Home() {
  const { fetchHomeData, trending, upcoming, nowPlaying} = useHomeStore();
  const tabBarHeight = useBottomTabBarHeight();


  useEffect(() => {
    fetchHomeData();
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      <Header
        onReviewsPress={() => console.log('Go to reviews')}
        onCommentsPress={() => console.log('Go to comments')}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
        showsVerticalScrollIndicator={false}>
        <View className="mt-2 gap-y-6">
          <TrendingSection movies={trending} />
          <MediaRowSection title='Future Picks' movies={upcoming} />
          <MediaRowSection title='Hidden Gems' movies={nowPlaying} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
