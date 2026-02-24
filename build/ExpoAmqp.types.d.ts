export type AmqpOptions = {
    url?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    virtualHost?: string;
};
export type AmqpConnectEventPayload = {
    success: boolean;
};
export type AmqpDisconnectEventPayload = {
    manual?: boolean;
};
export type AmqpMessageEventPayload = {
    queue: string;
    message: string;
    routingKey: string;
    exchange: string;
};
export type AmqpErrorEventPayload = {
    error: string;
};
export type ExpoAmqpModuleEvents = {
    onAmqpConnect: (params: AmqpConnectEventPayload) => void;
    onAmqpDisconnect: (params: AmqpDisconnectEventPayload) => void;
    onAmqpMessage: (params: AmqpMessageEventPayload) => void;
    onAmqpError: (params: AmqpErrorEventPayload) => void;
};
//# sourceMappingURL=ExpoAmqp.types.d.ts.map