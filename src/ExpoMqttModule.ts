import { requireNativeModule } from 'expo-modules-core';
import { ExchangeType } from './ExpoMqtt.types';

interface ExpoMqttModule {
  // AMQP
  amqpConnect(url: string, username?: string, password?: string): Promise<void>;
  amqpDisconnect(): Promise<void>;
  amqpPublish(exchange: string, routingKey: string, message: string, type?: ExchangeType): Promise<void>;
  amqpDeclareExchange(name: string, type: ExchangeType): Promise<void>;
  amqpConsume(queue: string): Promise<void>;

  // MQTT
  mqttConnect(host: string, port: number, clientId: string, username?: string, password?: string): Promise<void>;
  mqttDisconnect(): Promise<void>;
  mqttPublish(topic: string, message: string): Promise<void>;
  mqttSubscribe(topic: string): Promise<void>;

  // Constants
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call internally queries native side for a module with the given name.
// It will look for a class that extends `Module` and has a `Name` call in its `definition`.
export default requireNativeModule<ExpoMqttModule>('ExpoMqtt');
