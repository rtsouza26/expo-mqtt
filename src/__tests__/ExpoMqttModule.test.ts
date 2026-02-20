// Mock the native module and view manager
jest.mock('expo', () => ({
    requireNativeModule: jest.fn(() => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
        publish: jest.fn(),
        addListener: jest.fn(),
        removeListeners: jest.fn(),
    })),
    requireNativeViewManager: jest.fn(() => 'View'),
    requireNativeView: jest.fn(() => 'View'),
}));

import ExpoMqtt from '../index';

describe('ExpoMqtt', () => {
    it('defines the module', () => {
        expect(ExpoMqtt).toBeDefined();
    });

    it('has MQTT methods', () => {
        expect(ExpoMqtt.connect).toBeDefined();
        expect(ExpoMqtt.disconnect).toBeDefined();
        expect(ExpoMqtt.subscribe).toBeDefined();
        expect(ExpoMqtt.unsubscribe).toBeDefined();
        expect(ExpoMqtt.publish).toBeDefined();
    });
});
