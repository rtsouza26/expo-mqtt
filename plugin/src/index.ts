import {
    ConfigPlugin,
    withInfoPlist,
    withAndroidManifest,
} from '@expo/config-plugins';

/**
 * Expo Config Plugin to automate native setup for expo-mqtt.
 * Adds INTERNET and ACCESS_NETWORK_STATE to Android.
 * Can be extended for iOS background modes if needed.
 */
const withExpoMqtt: ConfigPlugin<{
    iosBackgroundModes?: string[];
} | void> = (config, props) => {
    // 1. Android: Ensure Internet and Network State permissions
    config = withAndroidManifest(config, (config) => {
        const manifest = config.modResults.manifest;
        if (!manifest['uses-permission']) {
            manifest['uses-permission'] = [];
        }

        const permissions = ['android.permission.INTERNET', 'android.permission.ACCESS_NETWORK_STATE'];

        permissions.forEach(perm => {
            if (!manifest['uses-permission']?.some(p => p.$['android:name'] === perm)) {
                manifest['uses-permission']?.push({
                    $: { 'android:name': perm }
                });
            }
        });

        return config;
    });

    // 2. iOS: Optional background modes (e.g. ['fetch', 'remote-notification'])
    if (props?.iosBackgroundModes) {
        config = withInfoPlist(config, (config) => {
            const existingModes = (config.modResults.UIBackgroundModes as string[]) || [];
            config.modResults.UIBackgroundModes = [
                ...new Set([...existingModes, ...props.iosBackgroundModes!]),
            ];
            return config;
        });
    }

    return config;
};

export default withExpoMqtt;
