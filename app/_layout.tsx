import '~/global.css';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 400,
  fade: true
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signin" />
        <Stack.Screen name="signup" />
      </Stack.Protected>
      <Stack.Protected guard={!!isSignedIn}>
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
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <InitialLayout />
    </ClerkProvider>
  );
}
