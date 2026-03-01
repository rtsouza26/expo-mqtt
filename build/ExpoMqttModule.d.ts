import { ExchangeType } from './ExpoMqtt.types';
interface ExpoMqttModule {
    amqpConnect(url: string): Promise<void>;
    amqpDisconnect(): Promise<void>;
    amqpPublish(exchange: string, routingKey: string, message: string, type?: ExchangeType): Promise<void>;
    amqpDeclareExchange(name: string, type: ExchangeType): Promise<void>;
    amqpConsume(queue: string): Promise<void>;
    mqttConnect(host: string, port: number, clientId: string, username?: string, password?: string): Promise<void>;
    mqttDisconnect(): Promise<void>;
    mqttPublish(topic: string, message: string): Promise<void>;
    mqttSubscribe(topic: string): Promise<void>;
    PI: number;
    hello(): string;
    setValueAsync(value: string): Promise<void>;
}
declare const _default: ExpoMqttModule;
export default _default;
//# sourceMappingURL=ExpoMqttModule.d.ts.map