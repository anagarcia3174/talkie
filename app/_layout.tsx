import '~/global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '~/context/AuthContext';
import LoadingScreen from '~/components/LoadingScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toastConfig } from '~/components/ToastConfig';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

// SplashScreen.setOptions({
//   duration: 400,
//   fade: true
// });

const InitialLayout = () => {
  const { user, loading, accountDeleted } = useAuth();

  if (loading) {
    return <LoadingScreen fullScreen={true} />;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="index" />
        </Stack.Protected>
        <Stack.Protected guard={!!user && !accountDeleted}>
          <Stack.Screen name="(protected)" />
        </Stack.Protected>
        <Stack.Protected guard={!!user && accountDeleted}>
          <Stack.Screen name="account-deleted" />
        </Stack.Protected>
      </Stack>
    </SafeAreaProvider>
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
  const insets = useSafeAreaInsets();

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

      <Toast
        config={toastConfig}
        position="top"
        topOffset={insets.top + 10}
        onPress={() => Toast.hide()}
      />
    </AuthProvider>
  );
}
