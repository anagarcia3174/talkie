import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '~/components/Header';
import { TMDBBaseMedia, TMDBReview } from '~/types/tmdbTypes';
import { Text, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import Carousel from 'react-native-reanimated-carousel'
import TrendingSection from '~/components/TrendingSection';
import { useHomeStore } from '~/store/homeStore';
import { useEffect } from 'react';
import ReviewSection from '~/components/ReviewsSection';
const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.65; // main poster size
const ITEM_HEIGHT = ITEM_WIDTH * 1.5; // keep poster ratio

export default function Home() {
  const { trending, fetchHomeData, reviews} = useHomeStore();
  const movie: TMDBBaseMedia = {
    id: 1,
    title: 'DEMON SLAYER', // movies
    name: 'Movie Name', // tv shows
    overview: 'Overview Overview OverviewOverview Overview Overview ',
    poster_path: '/cvda8s5J8YaHjTyEyXQpvD6f3iV.jpg',
    backdrop_path: '/1RgPyOhN4DRs225BGTlHJqCudII.jpg',
    release_date: '2025-07-18', // movies
    vote_average: 7.701,
    media_type: 'movie', // sometimes included in trending
  };
  const movie2: TMDBBaseMedia = {
    id: 2,
    title: 'Desipicable Me', // movies
    name: 'Movie Name', // tv shows
    overview: 'Overview Overview OverviewOverview Overview Overview ',
    poster_path: '/rA3d4NDeTUVIVCfQtnxGzZ672N8.jpg',
    backdrop_path: '/1RgPyOhN4DRs225BGTlHJqCudII.jpg',
    release_date: '2025-07-18', // movies
    vote_average: 5.9,
    media_type: 'movie', // sometimes included in trending
  };
  const movie3: TMDBBaseMedia = {
    id: 3,
    title: 'Movie Title', // movies
    name: 'Movie Name', // tv shows
    overview: 'Overview Overview OverviewOverview Overview Overview ',
    poster_path: '/wgMS8irQKfMrR6mJhKtK6vbxDTC.jpg',
    backdrop_path: '/1RgPyOhN4DRs225BGTlHJqCudII.jpg',
    release_date: '2025-07-18', // movies
    vote_average: 7.701,
    media_type: 'movie', // sometimes included in trending
  };
  const review: TMDBReview = {
    id: '1',
    author: 'Jenny',
    author_details: {
      name: 'Jenny',
      username: 'boiband2',
      avatar_path: '/wed8frQ1VQFmFpdKMMxMQwOzhA5.jpg',
      rating: 10,
    },
    content:
      "🌟 10/10 – A Visual Masterpiece That Redefines Anime Cinema Demon Slayer: Kimetsu no Yaiba – Infinity Castle is not just anime—it's an art form in motion. Ufotable has once again shattered expectations, delivering what is arguably the greatest animation ever seen in anime history. Every frame of Infinity Castle is a painting. Every battle is a symphony of light, color, movement, and emotion.\r\n\r\nThe sheer scale of the Infinity Castle arc is staggering. Shifting gravity, kaleidoscopic architecture, and relentless pacing pull you into a world that feels boundless and terrifying. And through this madness, the animators create visual clarity and storytelling precision that defy logic. The fights aren’t just flashy—they’re intimate, brutal, and deeply emotional. You feel every breath, every strike, every sacrifice.\r\n\r\nTanjiro, Zenitsu, Inosuke, and the Hashira face impossible odds with a sense of weight and urgency that grips your chest. Character moments hit harder than ever. The Upper Moons are terrifying in both presence and power. And Muzan? An absolute force of dread.\r\n\r\nWhat truly sets Infinity Castle apart isn’t just the spectacle—though it is unparalleled. It’s the way the animation serves the heart of the story. Loyalty, grief, fury, and love are painted across the screen with every cut, every cry, every flicker of a blade.\r\n\r\nThis is peak anime. A cultural milestone. A visual symphony.\r\nDemon Slayer: Infinity Castle is what happens when anime dares to be legendary.\r\n\r\n🔥 A flawless 10/10. Nothing comes close. 🔥",
    created_at: '2025-08-03T19:10:54.390Z',
    movie: {
      id: 1,
      title: movie.title!,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date!,
    }
  };
  const items = [movie, movie2, movie3, movie, movie2, movie3];

  useEffect(() => {
    fetchHomeData();
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      <Header
        onReviewsPress={() => console.log('Go to reviews')}
        onCommentsPress={() => console.log('Go to comments')}
      />
      <TrendingSection movies={trending}/>
      <ReviewSection reviews={reviews} />

    </SafeAreaView>
  );
}
