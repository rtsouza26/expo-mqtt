import { registerWebModule, NativeModule } from 'expo';

import { ExpoMqttModuleEvents, ExchangeType } from './ExpoMqtt.types';

class ExpoMqttModule extends NativeModule<ExpoMqttModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }

  // AMQP Web placeholders
  async amqpConnect(url: string): Promise<void> {
    console.warn('amqpConnect is not implemented on web');
  }
  async amqpDisconnect(): Promise<void> {
    console.warn('amqpDisconnect is not implemented on web');
  }
  async amqpPublish(exchange: string, routingKey: string, message: string, type?: ExchangeType): Promise<void> {
    console.warn('amqpPublish is not implemented on web');
  }
  async amqpDeclareExchange(name: string, type: ExchangeType): Promise<void> {
    console.warn('amqpDeclareExchange is not implemented on web');
  }
  async amqpDeclareQueue(name: string): Promise<void> {
    console.warn('amqpDeclareQueue is not implemented on web');
  }
  async amqpConsume(queue: string): Promise<void> {
    console.warn('amqpConsume is not implemented on web');
  }

  // MQTT Web placeholders
  async mqttConnect(host: string, port: number, clientId: string): Promise<void> {
    console.warn('mqttConnect is not implemented on web');
  }
  async mqttDisconnect(): Promise<void> {
    console.warn('mqttDisconnect is not implemented on web');
  }
  async mqttPublish(topic: string, message: string): Promise<void> {
    console.warn('mqttPublish is not implemented on web');
  }
  async mqttSubscribe(topic: string): Promise<void> {
    console.warn('mqttSubscribe is not implemented on web');
  }
}

export default registerWebModule(ExpoMqttModule, 'ExpoMqtt');
