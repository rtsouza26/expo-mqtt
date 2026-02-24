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

import { ExpoAmqp } from '../index';
import { requireNativeModule } from 'expo';

describe('ExpoAmqp', () => {
    const mockAmqp = requireNativeModule('ExpoAmqp');

    it('defines the module', () => {
        expect(ExpoAmqp).toBeDefined();
    });

    it('calls connect with options', async () => {
        const options = { url: 'amqp://localhost' };
        await ExpoAmqp.connect(options);
        expect(mockAmqp.connect).toHaveBeenCalledWith(options);
    });

    it('calls exchangeDeclare', async () => {
        await ExpoAmqp.exchangeDeclare('test-ex', 'direct', true);
        expect(mockAmqp.exchangeDeclare).toHaveBeenCalledWith('test-ex', 'direct', true);
    });

    it('calls queueDeclare', async () => {
        await ExpoAmqp.queueDeclare('test-q', true);
        expect(mockAmqp.queueDeclare).toHaveBeenCalledWith('test-q', true);
    });

    it('calls queueBind', async () => {
        await ExpoAmqp.queueBind('test-q', 'test-ex', 'routing-key');
        expect(mockAmqp.queueBind).toHaveBeenCalledWith('test-q', 'test-ex', 'routing-key');
    });

    it('calls publish', async () => {
        await ExpoAmqp.publish('test-ex', 'routing-key', 'msg');
        expect(mockAmqp.publish).toHaveBeenCalledWith('test-ex', 'routing-key', 'msg');
    });

    it('calls consume', async () => {
        await ExpoAmqp.consume('test-q');
        expect(mockAmqp.consume).toHaveBeenCalledWith('test-q');
    });

    it('calls disconnect', async () => {
        await ExpoAmqp.disconnect();
        expect(mockAmqp.disconnect).toHaveBeenCalled();
    });
});
