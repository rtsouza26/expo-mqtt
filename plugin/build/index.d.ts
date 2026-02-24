import { ConfigPlugin } from '@expo/config-plugins';
/**
 * Expo Config Plugin to automate native setup for expo-mqtt.
 * Adds INTERNET and ACCESS_NETWORK_STATE to Android.
 * Can be extended for iOS background modes if needed.
 */
declare const withExpoMqtt: ConfigPlugin<{
    iosBackgroundModes?: string[];
} | void>;
export default withExpoMqtt;
//# sourceMappingURL=index.d.ts.map