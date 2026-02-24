import { NativeModule } from 'expo';
import { ExpoMqttModuleEvents } from './ExpoMqtt.types';
declare class ExpoMqttModule extends NativeModule<ExpoMqttModuleEvents> {
    PI: number;
    setValueAsync(value: string): Promise<void>;
    hello(): string;
}
declare const _default: typeof ExpoMqttModule;
export default _default;
//# sourceMappingURL=ExpoMqttModule.web.d.ts.map