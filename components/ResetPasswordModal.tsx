import { useState } from 'react';
import { useSignIn } from '@clerk/clerk-expo';
import { getClerkErrorMessage } from '~/utils/clerkError';
import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { Modal, View, Pressable, Text, TouchableOpacity, TextInput } from 'react-native';
import { X, Eye, EyeClosed } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';

interface ResetPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ResetPasswordModal({ visible, onClose }: ResetPasswordModalProps) {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, setActive, isLoaded } = useSignIn();
  const [error, setError] = useState('');
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);

  const onSubmit = async () => {
    if (!isLoaded) {
      return;
    }
    try {
      setLoading(true);
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result.status === 'complete') {
        setPassword('');
        setCode('');
        onClose();
        setActive({ session: result.createdSessionId });
        return;
      } else {
        setError(
          'There was an error resetting your password. If the error persists, contact support.'
        );
      }
    } catch (e) {
      if (isClerkAPIResponseError(e)) {
        setError(
          getClerkErrorMessage(e) ??
            'There was an error resetting your password. If the error persists, contact support.'
        );
      } else {
        setError(
          'There was an error resetting your password. If the error persists, contact support.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setCode('');
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center px-6">
        <Pressable onPress={onClose} style={{ position: 'absolute', inset: 0 }}>
          <View className="flex-1 bg-primary-950 opacity-50" />
        </Pressable>

        <View className="w-full max-w-sm rounded-2xl bg-primary-100 p-6 shadow-lg dark:bg-primary-900">
          <View className=" flex-row items-center justify-between">
            <Text className="font-SpaceGrotesk-Bold text-2xl text-primary-900 dark:text-primary-100">
              Reset Password
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-1" disabled={loading}>
              <X size={24} color={theme.primary[800]} />
            </TouchableOpacity>
          </View>

          <Text className="mb-8 font-SpaceGrotesk-Regular text-base leading-5 text-primary-800 dark:text-primary-200">
            Enter the code sent to your email and set a new password.
          </Text>

          {error && (
            <View className="mb-4 rounded-lg bg-red-400 px-4 py-3 dark:bg-red-800">
              <Text className="text-md font-SpaceGrotesk-Medium text-white dark:text-red-100">
                {error}
              </Text>
            </View>
          )}
          <View className="mb-6 gap-y-4">
            <View>
              <Text className="mb-2 font-SpaceGrotesk-Regular text-lg text-primary-950 dark:text-primary-100">
                New Password
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
                  placeholder="Enter a new password"
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
            <View>
              <Text className="mb-2 font-SpaceGrotesk-Regular text-lg text-primary-950 dark:text-primary-100">
                Verification Code
              </Text>
              <TextInput
                className="rounded-lg border  border-primary-700 py-3 text-center text-lg text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-400 dark:text-primary-200 focus:dark:border-primary-50"
                value={code}
                onChangeText={setCode}
                cursorColor={theme.primary[700]}
                selectionColor={theme.primary[700]}
                placeholder="Enter code"
                placeholderTextColor={theme.primary[500]}
                keyboardType="number-pad"
                autoFocus
                editable={!loading}
                maxLength={6}
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={onSubmit}
            disabled={code.trim() === '' || loading}
            className={`w-full flex-row items-center justify-center gap-3 rounded-xl bg-primary-900 p-4 dark:bg-primary-100`}>
            <Text className="font-SpaceGrotesk-Medium text-lg text-primary-50 dark:text-primary-900">
              {loading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
