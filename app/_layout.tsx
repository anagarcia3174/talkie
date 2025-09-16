import '~/global.css';

import { Stack } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '~/context/AuthContext';
import LoadingScreen from '~/components/LoadingScreen';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 400,
  fade: true
});


const InitialLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen fullScreen={true} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>
    </Stack>
  );
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'SpaceGrotesk-Bold': require('../assets/fonts/SpaceGrotesk-Bold.ttf'),
    'SpaceGrotesk-Light': require('../assets/fonts/SpaceGrotesk-Light.ttf'),
    'SpaceGrotesk-Medium': require('../assets/fonts/SpaceGrotesk-Medium.ttf'),
    'SpaceGrotesk-Regular': require('../assets/fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-SemiBold': require('../assets/fonts/SpaceGrotesk-SemiBold.ttf'),

  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
