import { NativeModule } from 'expo';
import { ExpoAmqpModuleEvents, AmqpOptions } from './ExpoAmqp.types';
declare class ExpoAmqpModule extends NativeModule<ExpoAmqpModuleEvents> {
    connect(options: AmqpOptions): Promise<void>;
    disconnect(): Promise<void>;
    exchangeDeclare(name: string, type: string, durable: boolean): Promise<void>;
    queueDeclare(name: string, durable: boolean): Promise<string>;
    queueBind(queue: string, exchange: string, routingKey: string): Promise<void>;
    publish(exchange: string, routingKey: string, message: string): Promise<void>;
    consume(queue: string): Promise<void>;
}
declare const _default: ExpoAmqpModule;
export default _default;
//# sourceMappingURL=ExpoAmqpModule.d.ts.map