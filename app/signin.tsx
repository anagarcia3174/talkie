import { ScrollView, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTheme } from '~/hooks/useTheme';
import { Eye, EyeClosed } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { getClerkErrorMessage } from '~/utils/clerkError';
import ResetPasswordModal from '~/components/ResetPasswordModal';

export default function Signin() {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);
  const theme = useTheme();
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingCode, setPendingCode] = useState(false);

  const handleSignIn = async () => {
    if (!isLoaded) {
      return;
    }
    try {
      setLoading(true);
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
      } else {
        setError('There was an error signing you in. If the problem persists, contact support.');
      }
    } catch (e) {
      if (isClerkAPIResponseError(e)) {
        setError(
          getClerkErrorMessage(e) ??
            'There was an error signing you in. If the problem persists, contact support.'
        );
      } else {
        setError('There was an error signing you in. If the problem persists, contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!emailAddress.trim()) {
      setError('Please enter your email to reset your password.');
      return;
    }

    if (!isLoaded) {
      return;
    }

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress,
      });

      setPendingCode(true);
    } catch (e) {
      if (isClerkAPIResponseError(e)) {
        setError(
          getClerkErrorMessage(e) ??
            'There was an error sending your forgot password code. If the error persists, contact support.'
        );
      } else {
        setError(
          'There was an error sending your forgot password code. If the error persists, contact support.'
        );
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-100 dark:bg-primary-950">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardDismissMode="interactive"
        className="px-4">
        <View className="flex-1 justify-between py-8">
          <View className="flex-1 justify-center">
            <View className="mb-16">
              <Text className="font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-100">
                Welcome Back!
              </Text>
              <Text className="text-md mt-2 font-SpaceGrotesk-Light text-primary-950 dark:text-primary-100">
                Please enter your details to log in.
              </Text>
            </View>
            {error && (
              <View className="mb-4 rounded-lg bg-red-400 px-4 py-3 dark:bg-red-800">
                <Text className="text-md font-SpaceGrotesk-Medium text-white dark:text-red-100">
                  {error}
                </Text>
              </View>
            )}
            <View className="gap-y-6">
              <View>
                <Text className="mb-2 font-SpaceGrotesk-Regular text-lg text-primary-950 dark:text-primary-100">
                  Email Address
                </Text>
                <TextInput
                  className="text-md rounded-lg border border-primary-700 px-3 py-4 text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-400 dark:text-primary-200 focus:dark:border-primary-50"
                  value={emailAddress}
                  onChangeText={(t) => setEmailAddress(t)}
                  cursorColor={theme.primary[700]}
                  selectionColor={theme.primary[700]}
                  placeholder="email@example.com"
                  placeholderTextColor={theme.primary[500]}
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text className="mb-2 font-SpaceGrotesk-Regular text-lg text-primary-950 dark:text-primary-100">
                  Password
                </Text>
                <View
                  className={`flex-row items-center rounded-lg pr-4 ${
                    focusPassword
                      ? 'border-2 border-primary-950 dark:border-primary-50'
                      : 'border border-primary-700 dark:border-primary-400'
                  }`}>
                  <TextInput
                    className="text-md flex-1 px-3 py-4 text-primary-950 dark:text-primary-200"
                    value={password}
                    onChangeText={(t) => setPassword(t)}
                    cursorColor={theme.primary[700]}
                    selectionColor={theme.primary[700]}
                    placeholder="*********"
                    placeholderTextColor={theme.primary[500]}
                    secureTextEntry={!showPassword}
                    autoCorrect={false}
                    onFocus={() => setFocusPassword(true)}
                    onBlur={() => setFocusPassword(false)}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <Eye color={theme.primary[600]} />
                    ) : (
                      <EyeClosed color={theme.primary[600]} />
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
            <View className="mt-6 items-end">
              <Pressable onPress={handleForgotPassword}>
                <Text className="text-md font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-100">
                  Forgot Password?
                </Text>
              </Pressable>
            </View>
          </View>
          <View className="gap-y-4 pb-8">
            <Pressable
              onPress={handleSignIn}
              className="rounded-xl bg-primary-900 p-4 dark:bg-primary-100">
              {loading ? (
                <ActivityIndicator color={theme.primary[100]} />
              ) : (
                <Text className="text-center font-SpaceGrotesk-SemiBold text-lg text-primary-100 dark:text-primary-900">
                  Sign In
                </Text>
              )}
            </Pressable>
            <View className="flex-row items-center justify-center gap-x-1">
              <Text className="text-md font-SpaceGrotesk-Regular text-primary-950 dark:text-primary-200">
                Don't have an account?
              </Text>
              <Pressable
                onPress={() => {
                  router.replace('/signup');
                }}>
                <Text className="text-md font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50">
                  Sign Up
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <ResetPasswordModal visible={pendingCode} onClose={() => setPendingCode(false)} />
    </SafeAreaView>
  );
}
