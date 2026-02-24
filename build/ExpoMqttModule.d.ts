import { NativeModule } from 'expo';
import { ExpoMqttModuleEvents, MqttOptions } from './ExpoMqtt.types';
declare class ExpoMqttModule extends NativeModule<ExpoMqttModuleEvents> {
    connect(options: MqttOptions): Promise<void>;
    disconnect(): Promise<void>;
    subscribe(topic: string, qos: number): Promise<void>;
    unsubscribe(topic: string): Promise<void>;
    publish(topic: string, message: string): Promise<void>;
}
declare const _default: ExpoMqttModule;
export default _default;
//# sourceMappingURL=ExpoMqttModule.d.ts.map