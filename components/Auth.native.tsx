// components/Auth.tsx
import { Platform, Alert, View, Text, StyleSheet, Dimensions } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '~/utils/supabase';
import { useTheme } from '~/hooks/useTheme';

export function Auth() {
  const { width } = Dimensions.get('window');
  const buttonWidth = width - 40;
  const theme = useTheme();

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
          error,
          data: { user },
        } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) {
          throw error;
        }

        console.log('User signed in:', user?.email);
        // Navigation or success handling will be handled by AuthContext
      } else {
        throw new Error('No identity token received');
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        console.log('User canceled Apple Sign In');
      } else {
        console.error('Apple Sign In Error:', e);
        Alert.alert('Sign In Error', e.message || 'An error occurred during sign in');
      }
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
      {/* We'll add Google Sign In here next */}
      <Text className='text-primary-950 dark:text-primary-50 text-center'>
        Sign in options for Android coming soon...
      </Text>
    </View>
  )
}
