import { Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react-native';
import Toast, { BaseToastProps } from 'react-native-toast-message';
import { useTheme } from '~/hooks/useTheme';

const TOAST_WIDTH = Dimensions.get('window').width - 16;

type VariantKey = 'info' | 'success' | 'error' | 'warning';

const VARIANT_STYLES: Record<
  VariantKey,
  {
    container: string;
    text: string;
    border: string;
    Icon: any;
    iconColorLight: string;
    iconColorDark: string;
  }
> = {
  info: {
    container: 'bg-primary-600/10 dark:bg-primary-400/15',
    border: 'border-primary-600 dark:border-primary-400',
    text: 'text-primary-700 dark:text-primary-300',
    Icon: Info,
    iconColorLight: '#4a4a52',
    iconColorDark: '#b9b9bf',
  },
  success: {
    container: 'bg-emerald-500/10 dark:bg-emerald-400/15',
    border: 'border-emerald-500 dark:border-emerald-400',
    text: 'text-emerald-700 dark:text-emerald-400',
    Icon: CheckCircle,
    iconColorLight: '#007a55',
    iconColorDark: '#00d492',
  },
  warning: {
    container: 'bg-amber-500/10 dark:bg-amber-400/15',
    border: 'border-amber-500 dark:border-amber-400',
    text: 'text-amber-700 dark:text-amber-400',
    Icon: AlertTriangle,
    iconColorLight: '#bb4d00',
    iconColorDark: '#ffba00',
  },
  error: {
    container: 'bg-red-500/10 dark:bg-red-400/15',
    border: 'border-red-500 dark:border-red-400',
    text: 'text-red-700 dark:text-red-400',
    Icon: AlertCircle,
    iconColorLight: '#c10007',
    iconColorDark: '#ff6467',
  },
};

function ToastItem({ props, variantKey }: { props: BaseToastProps; variantKey: VariantKey }) {
  const theme = useTheme();
  const { container, border, text, Icon, iconColorDark, iconColorLight } =
    VARIANT_STYLES[variantKey];

  return (
    <View style={{ width: TOAST_WIDTH }} className="self-center">
      {/* Shadow wrapper */}
      <View
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
        }}
        className="rounded-2xl bg-primary-100 dark:bg-primary-900">
        <View className={`rounded-2xl border ${border} ${container} overflow-hidden`}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={props.onPress}
            className="flex-row items-center gap-3 px-4 py-4">
            {/* Icon */}
            <Icon
              size={18}
              strokeWidth={2.5}
              color={theme.isDark ? iconColorDark : iconColorLight}
            />

            {/* Text */}
            <View className="flex-1">
              <Text className={`text-[15px] font-medium leading-5 ${text}`}>{props.text1}</Text>

              {props.text2 && (
                <Text className={`mt-1 text-[13px] leading-5 ${text} opacity-80`}>
                  {props.text2}
                </Text>
              )}
            </View>

            {/* Close */}
            <TouchableOpacity
              onPress={() => Toast.hide()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="p-1">
              <X
                size={16}
                color={theme.isDark ? iconColorDark : iconColorLight}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export const toastConfig = {
  info: (props: BaseToastProps) => <ToastItem props={props} variantKey="info" />,
  success: (props: BaseToastProps) => <ToastItem props={props} variantKey="success" />,
  error: (props: BaseToastProps) => <ToastItem props={props} variantKey="error" />,
  warning: (props: BaseToastProps) => <ToastItem props={props} variantKey="warning" />,
};
