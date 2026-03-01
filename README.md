# expo-mqtt

[![license](https://img.shields.io/github/license/rtsouza26/expo-mqtt.svg)](https://github.com/rtsouza26/expo-mqtt/blob/main/LICENSE)

A high-performance MQTT and AMQP (RabbitMQ) client for Expo and React Native. This library provides a unified native interface for both protocols, optimized for modern mobile applications.

## Features

- 🔄 **Unified API**: Easy-to-use interfaces for both MQTT and AMQP.
- 🚀 **Native Performance**: Built using the Expo Modules API for maximum efficiency.
- 📱 **Cross-Platform**: Supports Android, iOS, and Web.
- 🔔 **Event-Driven**: Full support for connection, disconnection, and message events.

## Installation

### Managed Expo projects

```bash
npx expo install expo-mqtt
```

### Bare React Native projects

Ensure you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) first, then run:

```bash
npx expo install expo-mqtt
```

#### Android
No additional configuration required.

#### iOS
Run `npx pod-install` after installation.

## Usage

### Unified Client

```typescript
import ExpoMqtt from 'expo-mqtt';

// MQTT usage (host, port, clientId, username?, password?)
await ExpoMqtt.mqttConnect('broker.hivemq.com', 1883, 'my-client-id', 'user', 'pass');
await ExpoMqtt.mqttPublish('expo/test', 'Hello MQTT!');

// AMQP usage (url, username?, password?)
// Tip: Use a clean URL like 'amqp://localhost:5672' and pass credentials separately 
// to avoid URI encoding issues with special characters.
await ExpoMqtt.amqpConnect('amqp://192.168.1.1:5672', 'targino', 'password');
await ExpoMqtt.amqpPublish('amq.direct', 'routing-key', 'Hello RMQ!');
```

## API Reference

### MQTT Functions
- `mqttConnect(host: string, port: number, clientId: string, username?: string, password?: string): Promise<void>`
- `mqttDisconnect(): Promise<void>`
- `mqttPublish(topic: string, message: string): Promise<void>`
- `mqttSubscribe(topic: string): Promise<void>`

### AMQP Functions
- `amqpConnect(url: string, username?: string, password?: string): Promise<void>`
- `amqpDisconnect(): Promise<void>`
- `amqpPublish(exchange: string, routingKey: string, message: string, type?: ExchangeType): Promise<void>`
- `amqpDeclareExchange(name: string, type: ExchangeType): Promise<void>`
- `amqpConsume(queue: string): Promise<void>`

### Types
```typescript
type ExchangeType = 'direct' | 'fanout' | 'topic' | 'headers';
```

## Development

### Unit Tests
The library includes a suite of unit tests using Jest.
```bash
npm run test
```

### Example App Cleanup
To prevent sensitive credentials from being committed in the example app, we use a cleanup script:
```bash
node scripts/cleanup-example.js
```
*Note: A git pre-commit hook is automatically installed to run this script before every commit.*

## Contributing

Contributions are very welcome! Please refer to our [contributing guide](https://github.com/rtsouza26/expo-mqtt/blob/main/CONTRIBUTING.md).

## License

MIT © [Rafael Targino](https://github.com/rtsouza26)
