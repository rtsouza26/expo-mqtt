import type { StyleProp, ViewStyle } from 'react-native';

export type MqttOptions = {
  url: string;
  clientId?: string;
  username?: string;
  password?: string;
};

export type ConnectEventPayload = {
  success: boolean;
};

export type DisconnectEventPayload = {
  cause?: string;
  manual?: boolean;
};

export type MessageEventPayload = {
  topic: string;
  message: string;
};

export type ErrorEventPayload = {
  error: string;
};

export type ExpoMqttModuleEvents = {
  onConnect: (params: ConnectEventPayload) => void;
  onDisconnect: (params: DisconnectEventPayload) => void;
  onMessage: (params: MessageEventPayload) => void;
  onError: (params: ErrorEventPayload) => void;
  onChange: (params: ChangeEventPayload) => void;
};

export type OnLoadEventPayload = {
  url: string;
};

export type ChangeEventPayload = {
  value: string;
};

export type ExpoMqttViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
