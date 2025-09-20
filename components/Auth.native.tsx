// components/Auth.tsx
import { Platform, Alert, View, Text, StyleSheet, Dimensions } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '~/utils/supabase';
import { useTheme } from '~/hooks/useTheme';
import { useState } from 'react';

export function Auth() {
  const { width } = Dimensions.get('window');
  const buttonWidth = width - 40;
  const theme = useTheme();
  const [error, setError] = useState('');
  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const {
          error: signInError,
          data: { user },
        } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        // If success, clear any old error
        setError('');
      } else {
        throw new Error('No identity token received');
      }
    } catch (e: any) {
      setError(
        'An error ocurred while signing you in. Try again or contact support if the problem persists.'
      );
    }
  };

  if (Platform.OS === 'ios') {
    return (
      <View style={{ paddingHorizontal: 20 }}>
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={
            theme.isDark
              ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
          }
          cornerRadius={12}
          style={{
            width: buttonWidth,
            height: 50,
          }}
          onPress={handleAppleSignIn}
        />
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 20 }}>
      {error && (
        <View className="mb-4 rounded-lg bg-red-400 px-4 py-3 dark:bg-red-800">
          <Text className="text-md font-SpaceGrotesk-Medium text-white dark:text-red-100">
            {error}
          </Text>
        </View>
      )}
      <Text className="text-center text-primary-950 dark:text-primary-50">
        Sign in options for Android coming soon...
      </Text>
    </View>
  );
}
