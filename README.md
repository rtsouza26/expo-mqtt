# expo-mqtt

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

### MQTT

```typescript
import ExpoMqtt from 'expo-mqtt';

// Connect to a broker
await ExpoMqtt.connect({
  url: 'tcp://broker.example.com:1883',
  clientId: 'my-mobile-app',
  username: 'user',
  password: 'pass'
});

// Subscribe to a topic
await ExpoMqtt.subscribe('sensors/temperature', 1);

// Listen for messages
const subscription = ExpoMqtt.addListener('onMessage', (event) => {
  console.log(`Received message on ${event.topic}: ${event.message}`);
});

// Publish a message
await ExpoMqtt.publish('sensors/status', 'online');
```

### AMQP (RabbitMQ)

```typescript
import { ExpoAmqp } from 'expo-mqtt';

// Connect to a server
await ExpoAmqp.connect({
  url: 'amqp://guest:guest@localhost:5672'
});

// Declare a queue and consume
await ExpoAmqp.queueDeclare('logs-queue', true);
await ExpoAmqp.consume('logs-queue');

// Listen for messages
const amqpSubscription = ExpoAmqp.addListener('onAmqpMessage', (event) => {
  console.log(`Received AMQP message: ${event.message}`);
});

// Publish to an exchange
await ExpoAmqp.publish('', 'logs-queue', JSON.stringify({ level: 'info', msg: 'Started' }));
```

## API Reference

### MQTT Options
| Prop | Type | Description |
| :--- | :--- | :--- |
| `url` | `string` | Connection URL (e.g., `tcp://...`) |
| `clientId` | `string` | Unique client identifier |
| `username` | `string` | Auth username |
| `password` | `string` | Auth password |

### AMQP Options
| Prop | Type | Description |
| :--- | :--- | :--- |
| `url` | `string` | Connection URL (e.g., `amqp://...`) |
| `host` | `string` | Hostname |
| `port` | `number` | Port |
| `virtualHost` | `string` | VHost identifier |

## Contributing

Contributions are very welcome! Please refer to our [contributing guide](https://github.com/rtsouza26/expo-mqtt/blob/main/CONTRIBUTING.md).

## License

MIT © [Rafael Targino](https://github.com/rtsouza26)
