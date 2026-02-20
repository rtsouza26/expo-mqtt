import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoMqttViewProps } from './ExpoMqtt.types';

const NativeView: React.ComponentType<ExpoMqttViewProps> =
  requireNativeView('ExpoMqtt');

export default function ExpoMqttView(props: ExpoMqttViewProps) {
  return <NativeView {...props} />;
}
