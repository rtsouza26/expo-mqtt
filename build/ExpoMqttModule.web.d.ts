import { NativeModule } from 'expo';
import { ExpoMqttModuleEvents, ExchangeType } from './ExpoMqtt.types';
declare class ExpoMqttModule extends NativeModule<ExpoMqttModuleEvents> {
    PI: number;
    setValueAsync(value: string): Promise<void>;
    hello(): string;
    amqpConnect(url: string): Promise<void>;
    amqpDisconnect(): Promise<void>;
    amqpPublish(exchange: string, routingKey: string, message: string, type?: ExchangeType): Promise<void>;
    amqpDeclareExchange(name: string, type: ExchangeType): Promise<void>;
    amqpDeclareQueue(name: string): Promise<void>;
    amqpConsume(queue: string): Promise<void>;
    mqttConnect(host: string, port: number, clientId: string): Promise<void>;
    mqttDisconnect(): Promise<void>;
    mqttPublish(topic: string, message: string): Promise<void>;
    mqttSubscribe(topic: string): Promise<void>;
}
declare const _default: typeof ExpoMqttModule;
export default _default;
//# sourceMappingURL=ExpoMqttModule.web.d.ts.map