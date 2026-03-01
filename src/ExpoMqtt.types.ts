export type ChangeEventPayload = {
  value: string;
};

export type ExchangeType = 'direct' | 'fanout' | 'topic' | 'headers';

export type AmqpMessagePayload = {
  queue: string;
  message: string;
};

export type MqttMessagePayload = {
  topic: string;
  message: string;
};

export type StatusPayload = {
  status: string;
};

export type ExpoMqttModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
  onAmqpMessage: (params: AmqpMessagePayload) => void;
  onMqttMessage: (params: MqttMessagePayload) => void;
  onStatusChange: (params: StatusPayload) => void;
};

export type ExpoMqttViewProps = {
  url: string;
  onLoad?: (event: { nativeEvent: { url: string } }) => void;
  style?: any;
};
