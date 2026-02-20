// Mock the native module and view manager
jest.mock('expo', () => ({
    requireNativeModule: jest.fn(() => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        exchangeDeclare: jest.fn(),
        queueDeclare: jest.fn(),
        queueBind: jest.fn(),
        publish: jest.fn(),
        consume: jest.fn(),
        addListener: jest.fn(),
        removeListeners: jest.fn(),
    })),
    requireNativeViewManager: jest.fn(() => 'View'),
    requireNativeView: jest.fn(() => 'View'),
}));

import { ExpoAmqp } from '../index';

describe('ExpoAmqp', () => {
    it('defines the module', () => {
        expect(ExpoAmqp).toBeDefined();
    });

    it('has AMQP methods', () => {
        expect(ExpoAmqp.connect).toBeDefined();
        expect(ExpoAmqp.disconnect).toBeDefined();
        expect(ExpoAmqp.exchangeDeclare).toBeDefined();
        expect(ExpoAmqp.queueDeclare).toBeDefined();
        expect(ExpoAmqp.queueBind).toBeDefined();
        expect(ExpoAmqp.publish).toBeDefined();
        expect(ExpoAmqp.consume).toBeDefined();
    });
});
