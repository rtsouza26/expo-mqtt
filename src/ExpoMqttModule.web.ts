import { registerWebModule, NativeModule } from 'expo';

import { ExpoMqttModuleEvents } from './ExpoMqtt.types';

class ExpoMqttModule extends NativeModule<ExpoMqttModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoMqttModule, 'ExpoMqttModule');
