import Carousel from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Dimensions } from 'react-native'; // Add this import!
import { Header } from '~/components/Header';
import { TMDBBaseMedia } from '~/types/tmdbTypes';
import HeroBanner from '~/components/HeroBanner';
import Section from '~/components/Section';

export default function Home() {
  const movie: TMDBBaseMedia = {
    id: 1,
    title: 'Movie Title', // movies
    name: 'Movie Name', // tv shows
    overview: 'Overview Overview OverviewOverview Overview Overview ',
    poster_path: '/sUsVimPdA1l162FvdBIlmKBlWHx.jpg',
    backdrop_path: '/1RgPyOhN4DRs225BGTlHJqCudII.jpg',
    release_date: '2025-07-18', // movies
    vote_average: 7.701,
    media_type: 'movie', // sometimes included in trending
  };
  const movie2: TMDBBaseMedia = {
    id: 2,
    title: 'Movie Title', // movies
    name: 'Movie Name', // tv shows
    overview: 'Overview Overview OverviewOverview Overview Overview ',
    poster_path: '/sUsVimPdA1l162FvdBIlmKBlWHx.jpg',
    backdrop_path: '/1RgPyOhN4DRs225BGTlHJqCudII.jpg',
    release_date: '2025-07-18', // movies
    vote_average: 7.701,
    media_type: 'movie', // sometimes included in trending
  };
  const movie3: TMDBBaseMedia = {
    id: 3,
    title: 'Movie Title', // movies
    name: 'Movie Name', // tv shows
    overview: 'Overview Overview OverviewOverview Overview Overview ',
    poster_path: '/sUsVimPdA1l162FvdBIlmKBlWHx.jpg',
    backdrop_path: '/1RgPyOhN4DRs225BGTlHJqCudII.jpg',
    release_date: '2025-07-18', // movies
    vote_average: 7.701,
    media_type: 'movie', // sometimes included in trending
  };
  const { width } = Dimensions.get('window');
  const items = [movie, movie2, movie3];

  return (
    <SafeAreaView className="flex-1 bg-primary-100 dark:bg-primary-950">
      <Header
        onReviewsPress={() => console.log('Go to reviews')}
        onCommentsPress={() => console.log('Go to comments')}
      />

      <Section title="Trending Today">
        <View className='h-64'>
        <Carousel
          width={width}
          data={items}
          autoPlay
          autoPlayInterval={6000}
          scrollAnimationDuration={1500}
          loop
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 1,
            parallaxScrollingOffset: 22,
          }}
          renderItem={({ item }) => (
            <View className="px-4">
              <HeroBanner
                media={item}
                onMarkWatched={() => console.log('Watched', item.id)}
                onAddToList={() => console.log('Wishlist', item.id)}
              />
            </View>
          )}
        />
        </View>
      </Section>

      <Section title="Notable Reviews">
        <Text className="px-4 text-primary-800 dark:text-primary-200">
          Personalized recommendations based on your viewing history.
        </Text>
      </Section>
      <Section title="Your progress">
        <Text className="px-4 text-primary-800 dark:text-primary-200">
          Personalized recommendations based on your viewing history.
        </Text>
      </Section>
      <Section title="Upcoming">
        <Text className="px-4 text-primary-800 dark:text-primary-200">
          Personalized recommendations based on your viewing history.
        </Text>
      </Section>
      <Section title="Hidden Gems">
        <Text className="px-4 text-primary-800 dark:text-primary-200">
          Personalized recommendations based on your viewing history.
        </Text>
      </Section>
    </SafeAreaView>
  );
}
