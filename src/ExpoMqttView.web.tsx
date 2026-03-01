import * as React from 'react';

import { ExpoMqttViewProps } from './ExpoMqtt.types';

export default function ExpoMqttView(props: ExpoMqttViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad?.({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
