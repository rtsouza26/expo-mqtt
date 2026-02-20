import { NativeModule, requireNativeModule } from 'expo';

import { ExpoMqttModuleEvents, MqttOptions } from './ExpoMqtt.types';

declare class ExpoMqttModule extends NativeModule<ExpoMqttModuleEvents> {
  connect(options: MqttOptions): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(topic: string, qos: number): Promise<void>;
  unsubscribe(topic: string): Promise<void>;
  publish(topic: string, message: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoMqttModule>('ExpoMqtt');
