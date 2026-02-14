import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AlertTriangle, RotateCcw, LogOut } from 'lucide-react-native';

import { useTheme } from '~/hooks/useTheme';
import { useAuth } from '~/context/AuthContext';
import Toast from 'react-native-toast-message';

export default function AccountDeletedScreen() {
  const { restoreAccount, signOut } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    try {
      setLoading(true);

      const result = await restoreAccount();

      if (!result?.success) {
        Toast.show({
          type: 'error',
          text1: 'Restore Failed',
          text2: result?.error || 'Unable to restore your account.',
        });
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Account Restored!',
        text2: 'Your account is now active again.',
      });
      setTimeout(() => router.replace('/'), 500);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Restore Failed',
        text2: 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      <View className="flex-1 items-center justify-center px-6">
        <AlertTriangle size={64} strokeWidth={1.5} color={theme.primary[900]} className="mb-6" />

        <Text className="mb-3 text-center font-SpaceGrotesk-SemiBold text-2xl text-primary-950 dark:text-primary-50">
          Your account has been deleted
        </Text>

        <Text className="mb-8 text-center font-SpaceGrotesk-Regular text-base leading-6 text-primary-950 dark:text-primary-50">
          Your profile is currently inactive. You can restore your account below. Some data like
          likes and follows may not be recoverable.
        </Text>

        {/* Restore Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleRestore}
          className="mb-4 w-full items-center rounded-xl bg-primary-900 py-4 dark:bg-primary-100">
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="flex-row items-center gap-2">
              <RotateCcw color={theme.primary[50]} size={18} />
              <Text className="text-base font-semibold text-primary-50 dark:text-primary-950">
                Restore Account
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleSignOut}
          className="flex-row items-center gap-2 py-2">
          <LogOut size={18} color={theme.primary[900]} />
          <Text className="font-SpaceGrotesk-Medium text-primary-900 dark:text-primary-100">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
