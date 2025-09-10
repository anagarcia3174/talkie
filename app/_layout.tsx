import "~/global.css"
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { Stack } from 'expo-router'
import { ActivityIndicator } from 'react-native';
import { tokenCache } from "@clerk/clerk-expo/token-cache"

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth screens - only available when NOT authenticated */}
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="index" />
        {/* <Stack.Screen name="signin" />
        <Stack.Screen name="signup" /> */}
      </Stack.Protected>
    </Stack>
  );
};

export default function RootLayout() {

    return (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <InitialLayout />
        </ClerkProvider>
    )

}