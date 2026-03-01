import { useEvent } from 'expo';
import ExpoMqtt from 'expo-mqtt';
import { ExchangeType } from '../src/ExpoMqtt.types';
import React, { useState } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function App() {
  const [amqpUrl, setAmqpUrl] = useState('');
  const [amqpUsername, setAmqpUsername] = useState('');
  const [amqpPassword, setAmqpPassword] = useState('');
  const [amqpExchange, setAmqpExchange] = useState('');
  const [amqpExchangeType, setAmqpExchangeType] = useState<ExchangeType>('');
  const [amqpRoutingKey, setAmqpRoutingKey] = useState('');
  const [amqpQueue, setAmqpQueue] = useState('');
  const [amqpMessage, setAmqpMessage] = useState('');

  const [mqttHost, setMqttHost] = useState('');
  const [mqttPort, setMqttPort] = useState('');
  const [mqttClientId, setMqttClientId] = useState('expo-client-' + Math.random().toString(16).substring(2, 8));
  const [mqttUsername, setMqttUsername] = useState('');
  const [mqttPassword, setMqttPassword] = useState('');
  const [mqttTopic, setMqttTopic] = useState('');
  const [mqttMessage, setMqttMessage] = useState('');

  const amqpMsgPayload = useEvent(ExpoMqtt, 'onAmqpMessage');
  const amqpStatusPayload = useEvent(ExpoMqtt, 'onAmqpStatus');
  const mqttMsgPayload = useEvent(ExpoMqtt, 'onMqttMessage');
  const mqttStatusPayload = useEvent(ExpoMqtt, 'onMqttStatus');


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Expo MQTT & AMQP</Text>

        <Group name="RabbitMQ (AMQP)">
          <TextInput style={styles.input} placeholder="Broker URL" value={amqpUrl} onChangeText={setAmqpUrl} />
          <TextInput style={styles.input} placeholder="Username (Optional)" value={amqpUsername} onChangeText={setAmqpUsername} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password (Optional)" value={amqpPassword} onChangeText={setAmqpPassword} secureTextEntry autoCapitalize="none" />
          <View style={styles.row}>
            <Button title="Connect" onPress={() => ExpoMqtt.amqpConnect(amqpUrl, amqpUsername || undefined, amqpPassword || undefined)} />
            <Button title="Disconnect" onPress={() => ExpoMqtt.amqpDisconnect()} color="red" />
          </View>
          <Text style={styles.status}>Status: {amqpStatusPayload?.status ?? 'Disconnected'}</Text>

          <TextInput style={styles.input} placeholder="Exchange Name" value={amqpExchange} onChangeText={setAmqpExchange} />
          <View style={styles.row}>
            {(['direct', 'fanout', 'topic', 'headers'] as ExchangeType[]).map((type) => (
              <Button
                key={type}
                title={type}
                color={amqpExchangeType === type ? '#007aff' : '#888'}
                onPress={() => setAmqpExchangeType(type)}
              />
            ))}
          </View>
          <Button title="Declare Exchange" onPress={() => ExpoMqtt.amqpDeclareExchange(amqpExchange, amqpExchangeType)} />

          <View style={styles.separator} />

          <TextInput style={styles.input} placeholder="Routing Key (blank = use Queue name)" value={amqpRoutingKey} onChangeText={setAmqpRoutingKey} />
          <TextInput style={styles.input} placeholder="Message" value={amqpMessage} onChangeText={setAmqpMessage} />
          <Button title="Publish Message" onPress={() => {
            const rk = amqpRoutingKey || amqpQueue;
            ExpoMqtt.amqpPublish(amqpExchange, rk, amqpMessage, amqpExchangeType);
          }} />

          <View style={styles.separator} />

          <TextInput style={styles.input} placeholder="Queue to Consume" value={amqpQueue} onChangeText={setAmqpQueue} />
          <Button title="Start Consuming" onPress={() => ExpoMqtt.amqpConsume(amqpQueue)} />
          {amqpMsgPayload && (
            <View style={styles.messageBox}>
              <Text style={styles.messageLabel}>Last Received [{amqpMsgPayload.queue}]:</Text>
              <Text>{amqpMsgPayload.message}</Text>
            </View>
          )}
        </Group>

        <Group name="MQTT (CocoaMQTT)">
          <TextInput style={styles.input} placeholder="Broker Host" value={mqttHost} onChangeText={setMqttHost} />
          <TextInput style={styles.input} placeholder="Port" value={mqttPort} onChangeText={setMqttPort} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Username (Optional)" value={mqttUsername} onChangeText={setMqttUsername} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password (Optional)" value={mqttPassword} onChangeText={setMqttPassword} secureTextEntry autoCapitalize="none" />
          <View style={styles.row}>
            <Button title="Connect" onPress={() => ExpoMqtt.mqttConnect(mqttHost, parseInt(mqttPort) || 1883, mqttClientId, mqttUsername || undefined, mqttPassword || undefined)} />
            <Button title="Disconnect" onPress={() => ExpoMqtt.mqttDisconnect()} color="red" />
          </View>
          <Text style={styles.status}>Status: {mqttStatusPayload?.status ?? 'Disconnected'}</Text>

          <TextInput style={styles.input} placeholder="Topic" value={mqttTopic} onChangeText={setMqttTopic} />
          <TextInput style={styles.input} placeholder="Message" value={mqttMessage} onChangeText={setMqttMessage} />
          <Button title="Publish Message" onPress={() => ExpoMqtt.mqttPublish(mqttTopic, mqttMessage)} />

          <View style={styles.separator} />

          <Button title="Subscribe to Topic" onPress={() => ExpoMqtt.mqttSubscribe(mqttTopic)} />
          {mqttMsgPayload && (
            <View style={styles.messageBox}>
              <Text style={styles.messageLabel}>Last Received [{mqttMsgPayload.topic}]:</Text>
              <Text>{mqttMsgPayload.message}</Text>
            </View>
          )}
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
    color: '#333',
  },
  group: {
    margin: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#444',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  status: {
    textAlign: 'center',
    marginVertical: 10,
    fontStyle: 'italic',
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  messageBox: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007aff',
  },
  messageLabel: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
});
