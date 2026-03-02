import { requireNativeModule } from 'expo-modules-core';
import ExpoMqttModule from '../ExpoMqttModule';

jest.mock('expo-modules-core', () => {
    const actual = jest.requireActual('expo-modules-core');
    return {
        ...actual,
        requireNativeModule: jest.fn().mockReturnValue({
            amqpConnect: jest.fn(),
            amqpDisconnect: jest.fn(),
            amqpPublish: jest.fn(),
            amqpDeclareExchange: jest.fn(),
            amqpConsume: jest.fn(),
            mqttConnect: jest.fn(),
            mqttDisconnect: jest.fn(),
            mqttPublish: jest.fn(),
            mqttSubscribe: jest.fn(),
            setValueAsync: jest.fn(),
        }),
    };
});

const MockedModule = requireNativeModule('ExpoMqtt');

describe('ExpoMqttModule', () => {
    it('should call amqpConnect with correct arguments', async () => {
        await ExpoMqttModule.amqpConnect('amqp://localhost', 'user', 'pass', 10);
        expect(MockedModule.amqpConnect).toHaveBeenCalledWith('amqp://localhost', 'user', 'pass', 10);
    });

    it('should call amqpDisconnect', async () => {
        await ExpoMqttModule.amqpDisconnect();
        expect(MockedModule.amqpDisconnect).toHaveBeenCalled();
    });

    it('should call amqpPublish with correct arguments', async () => {
        await ExpoMqttModule.amqpPublish('exc', 'rk', 'msg', 'direct');
        expect(MockedModule.amqpPublish).toHaveBeenCalledWith('exc', 'rk', 'msg', 'direct');
    });

    it('should call mqttConnect with correct arguments', async () => {
        await ExpoMqttModule.mqttConnect('localhost', 1883, 'client', 'u', 'p');
        expect(MockedModule.mqttConnect).toHaveBeenCalledWith('localhost', 1883, 'client', 'u', 'p');
    });

    it('should call mqttPublish with correct arguments', async () => {
        await ExpoMqttModule.mqttPublish('topic', 'message');
        expect(MockedModule.mqttPublish).toHaveBeenCalledWith('topic', 'message');
    });

    it('should call amqpDeclareExchange with correct arguments', async () => {
        await ExpoMqttModule.amqpDeclareExchange('my-exchange', 'direct');
        expect(MockedModule.amqpDeclareExchange).toHaveBeenCalledWith('my-exchange', 'direct');
    });

    it('should call amqpConsume with correct arguments', async () => {
        await ExpoMqttModule.amqpConsume('my-queue');
        expect(MockedModule.amqpConsume).toHaveBeenCalledWith('my-queue');
    });

    it('should call mqttDisconnect', async () => {
        await ExpoMqttModule.mqttDisconnect();
        expect(MockedModule.mqttDisconnect).toHaveBeenCalled();
    });

    it('should call mqttSubscribe with correct arguments', async () => {
        await ExpoMqttModule.mqttSubscribe('my/topic');
        expect(MockedModule.mqttSubscribe).toHaveBeenCalledWith('my/topic');
    });

    it('should call setValueAsync with correct arguments', async () => {
        await ExpoMqttModule.setValueAsync('new-value');
        expect(MockedModule.setValueAsync).toHaveBeenCalledWith('new-value');
    });
});
