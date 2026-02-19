import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false}}/>
        <Stack.Screen name="media/[id]" />
        <Stack.Screen name="list/[id]" />
        <Stack.Screen name="profile/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
