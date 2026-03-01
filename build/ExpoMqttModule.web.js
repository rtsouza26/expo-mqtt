import { registerWebModule, NativeModule } from 'expo';
class ExpoMqttModule extends NativeModule {
    PI = Math.PI;
    async setValueAsync(value) {
        this.emit('onChange', { value });
    }
    hello() {
        return 'Hello world! 👋';
    }
    // AMQP Web placeholders
    async amqpConnect(url) {
        console.warn('amqpConnect is not implemented on web');
    }
    async amqpDisconnect() {
        console.warn('amqpDisconnect is not implemented on web');
    }
    async amqpPublish(exchange, routingKey, message, type) {
        console.warn('amqpPublish is not implemented on web');
    }
    async amqpDeclareExchange(name, type) {
        console.warn('amqpDeclareExchange is not implemented on web');
    }
    async amqpDeclareQueue(name) {
        console.warn('amqpDeclareQueue is not implemented on web');
    }
    async amqpConsume(queue) {
        console.warn('amqpConsume is not implemented on web');
    }
    // MQTT Web placeholders
    async mqttConnect(host, port, clientId) {
        console.warn('mqttConnect is not implemented on web');
    }
    async mqttDisconnect() {
        console.warn('mqttDisconnect is not implemented on web');
    }
    async mqttPublish(topic, message) {
        console.warn('mqttPublish is not implemented on web');
    }
    async mqttSubscribe(topic) {
        console.warn('mqttSubscribe is not implemented on web');
    }
}
export default registerWebModule(ExpoMqttModule, 'ExpoMqtt');
//# sourceMappingURL=ExpoMqttModule.web.js.map