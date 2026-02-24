// Mock the native module and view manager
jest.mock('expo', () => {
    const mockMqtt = {
        connect: jest.fn(),
        disconnect: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
        publish: jest.fn(),
        addListener: jest.fn(),
        removeListeners: jest.fn(),
    };
    const mockAmqp = {
        connect: jest.fn(),
        disconnect: jest.fn(),
        exchangeDeclare: jest.fn(),
        queueDeclare: jest.fn(),
        queueBind: jest.fn(),
        publish: jest.fn(),
        consume: jest.fn(),
        addListener: jest.fn(),
        removeListeners: jest.fn(),
    };
    return {
        requireNativeModule: jest.fn((name) => {
            if (name === 'ExpoMqtt') return mockMqtt;
            if (name === 'ExpoAmqp') return mockAmqp;
            return {};
        }),
        requireNativeViewManager: jest.fn(() => 'View'),
        requireNativeView: jest.fn(() => 'View'),
    };
});

import ExpoMqtt from '../index';
import { requireNativeModule } from 'expo';

describe('ExpoMqtt', () => {
    const mockMqtt = requireNativeModule('ExpoMqtt');

    it('defines the module', () => {
        expect(ExpoMqtt).toBeDefined();
    });

    it('calls connect with correct options', async () => {
        const options = { url: 'tcp://localhost:1883', clientId: 'test-client' };
        await ExpoMqtt.connect(options);
        expect(mockMqtt.connect).toHaveBeenCalledWith(options);
    });

    it('calls subscribe with topic and qos', async () => {
        await ExpoMqtt.subscribe('test/topic', 1);
        expect(mockMqtt.subscribe).toHaveBeenCalledWith('test/topic', 1);
    });

    it('calls unsubscribe with topic', async () => {
        await ExpoMqtt.unsubscribe('test/topic');
        expect(mockMqtt.unsubscribe).toHaveBeenCalledWith('test/topic');
    });

    it('calls publish with topic and message', async () => {
        await ExpoMqtt.publish('test/topic', 'hello');
        expect(mockMqtt.publish).toHaveBeenCalledWith('test/topic', 'hello');
    });

    it('calls disconnect', async () => {
        await ExpoMqtt.disconnect();
        expect(mockMqtt.disconnect).toHaveBeenCalled();
    });
});
