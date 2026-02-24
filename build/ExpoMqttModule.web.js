import { registerWebModule, NativeModule } from 'expo';
class ExpoMqttModule extends NativeModule {
    PI = Math.PI;
    async setValueAsync(value) {
        this.emit('onChange', { value });
    }
    hello() {
        return 'Hello world! 👋';
    }
}
export default registerWebModule(ExpoMqttModule, 'ExpoMqttModule');
//# sourceMappingURL=ExpoMqttModule.web.js.map