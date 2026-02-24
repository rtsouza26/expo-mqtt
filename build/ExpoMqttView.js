import { requireNativeView } from 'expo';
import * as React from 'react';
const NativeView = requireNativeView('ExpoMqtt');
export default function ExpoMqttView(props) {
    return <NativeView {...props}/>;
}
//# sourceMappingURL=ExpoMqttView.js.map