import { ScrollView, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTheme } from '~/hooks/useTheme';
import { Eye, EyeClosed } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo';
import VerificationCodeModal from '~/components/VerificationCodeModal';
import { getClerkErrorMessage } from '~/utils/clerkError';

export default function Signup() {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [loading, setLoading] = useState(false);
  const [pendingCode, setPendingCode] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!isLoaded) {
      return;
    }
    try {
      setLoading(true);

      await signUp.create({
        emailAddress,
        password,
        username,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingCode(true);
    } catch (e) {
      if (isClerkAPIResponseError(e)) {
        setError(getClerkErrorMessage(e) ?? 'There was an error creating your account. If the error persists, contact support.');
      } else {
        setError(
          'There was an error creating your account. If the error persists, contact support.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (code: string) => {
    if (!isLoaded) {
      return;
    }
    try {
      setLoading(true);
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
      } else {
        setError('The code provided was incorrect, or there was an issue verifying the email.');
      }
    } catch (e) {
      if (isClerkAPIResponseError(e)) {
        setError(
          getClerkErrorMessage(e) ??
            'There was an error creating your account. If the error persists, contact support.'
        );
      } else {
        setError('There was an issue while verifying the code.');
      }
    } finally {
      setLoading(false);
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
                Create Account
              </Text>
              <Text className="text-md mt-2 font-SpaceGrotesk-Light text-primary-950 dark:text-primary-100">
                Please enter your details to create an account.
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
                  Username
                </Text>
                <TextInput
                  className="text-md rounded-lg border border-primary-700 px-3 py-4 text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-400 dark:text-primary-200 focus:dark:border-primary-50"
                  value={username}
                  onChangeText={(t) => setUsername(t)}
                  cursorColor={theme.primary[700]}
                  selectionColor={theme.primary[700]}
                  placeholder="uniqueUsername"
                  placeholderTextColor={theme.primary[500]}
                />
              </View>
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
                  <Pressable className="p-2" onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <Eye color={theme.primary[600]} />
                    ) : (
                      <EyeClosed color={theme.primary[600]} />
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
          <View className="gap-y-4 pb-8">
            <Pressable
              onPress={handleSignUp}
              className="rounded-xl bg-primary-900 p-4 dark:bg-primary-100">
              {loading ? (
                <ActivityIndicator color={theme.primary[100]} />
              ) : (
                <Text className="text-center font-SpaceGrotesk-SemiBold text-lg text-primary-100 dark:text-primary-900">
                  Sign Up
                </Text>
              )}
            </Pressable>
            <View className="flex-row items-center justify-center gap-x-1">
              <Text className="text-md font-SpaceGrotesk-Regular text-primary-950 dark:text-primary-200">
                Already have an account?
              </Text>
              <Pressable onPress={() => router.replace('/signin')}>
                <Text className="text-md font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50">
                  Sign In
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <VerificationCodeModal
        visible={pendingCode}
        onClose={() => setPendingCode(false)}
        title="Verify Email"
        message="Enter the code sent to your email to finalize creating your account"
        onSubmit={handleVerification}
        isLoading={loading}
      />
    </SafeAreaView>
  );
}
