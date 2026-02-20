import { useEvent } from 'expo';
import ExpoMqtt, { ExpoAmqp } from 'expo-mqtt';
import { useState, useEffect } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';

export default function App() {
  const [mode, setMode] = useState<'MQTT' | 'AMQP'>('MQTT');
  const [logs, setLogs] = useState<string[]>([]);

  // Common Config
  const [brokerUrl, setBrokerUrl] = useState('tcp://34.39.200.0:5672');
  const [username, setUsername] = useState('targino');
  const [password, setPassword] = useState('targino@21608');

  // MQTT State
  const [mqttTopic, setMqttTopic] = useState('hsm_clinic_broadcast');
  const [mqttMessage, setMqttMessage] = useState('Hello MQTT!');
  const [mqttConnected, setMqttConnected] = useState(false);

  // AMQP State
  const [amqpExchange, setAmqpExchange] = useState('');
  const [amqpQueue, setAmqpQueue] = useState('hsm_clinic_broadcast');
  const [amqpRoutingKey, setAmqpRoutingKey] = useState('');
  const [amqpMessage, setAmqpMessage] = useState('Hello AMQP!');
  const [amqpConnected, setAmqpConnected] = useState(false);

  // MQTT Events
  const onMqttConnect = useEvent(ExpoMqtt, 'onConnect');
  const onMqttDisconnect = useEvent(ExpoMqtt, 'onDisconnect');
  const onMqttMessage = useEvent(ExpoMqtt, 'onMessage');
  const onMqttError = useEvent(ExpoMqtt, 'onError');

  // AMQP Events
  const onAmqpConnect = useEvent(ExpoAmqp, 'onAmqpConnect');
  const onAmqpDisconnect = useEvent(ExpoAmqp, 'onAmqpDisconnect');
  const onAmqpMessage = useEvent(ExpoAmqp, 'onAmqpMessage');
  const onAmqpError = useEvent(ExpoAmqp, 'onAmqpError');

  // --- Effect Hooks for Logging ---
  useEffect(() => {
    if (onMqttConnect?.success) { addLog('MQTT: Connected'); setMqttConnected(true); }
  }, [onMqttConnect]);

  useEffect(() => {
    if (onMqttDisconnect) { addLog('MQTT: Disconnected'); setMqttConnected(false); }
  }, [onMqttDisconnect]);

  useEffect(() => {
    if (onMqttMessage) addLog(`MQTT Rx [${onMqttMessage.topic}]: ${onMqttMessage.message}`);
  }, [onMqttMessage]);

  useEffect(() => {
    if (onMqttError) addLog(`MQTT Error: ${onMqttError.error}`);
  }, [onMqttError]);

  useEffect(() => {
    if (onAmqpConnect?.success) { addLog('AMQP: Connected'); setAmqpConnected(true); }
  }, [onAmqpConnect]);

  useEffect(() => {
    if (onAmqpDisconnect) { addLog('AMQP: Disconnected'); setAmqpConnected(false); }
  }, [onAmqpDisconnect]);

  useEffect(() => {
    if (onAmqpMessage) addLog(`AMQP Rx [${onAmqpMessage.queue}]: ${onAmqpMessage.message}`);
  }, [onAmqpMessage]);

  useEffect(() => {
    if (onAmqpError) addLog(`AMQP Error: ${onAmqpError.error}`);
  }, [onAmqpError]);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

  // --- Actions ---

  const handleMqttConnect = async () => {
    try {
      const options: any = { url: brokerUrl, username, password };
      await ExpoMqtt.connect(options);
    } catch (e: any) { addLog(`MQTT Connect Err: ${e.message}`); }
  };

  const handleAmqpConnect = async () => {
    try {
      // Just extract host/port from URL/String or whatever for simplicity in this demo,
      // or let native module handle it. 
      // For standard rabbitmq port is 5672 usually, but user is using 34.39.200.0
      // We will assume the user puts the full AMQP connection string or we build it?
      // Let's assume user puts a standard AMQP URI or we use the fields.
      // For AMQP, standard port is 5672.
      const host = brokerUrl.replace('tcp://', '').split(':')[0];
      const options = {
        host: host,
        port: 5672, // Default AMQP port
        username,
        password
      };
      addLog(`AMQP Connecting to ${host}...`);
      await ExpoAmqp.connect(options);
    } catch (e: any) { addLog(`AMQP Connect Err: ${e.message}`); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Expo MQTT / AMQP</Text>

        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setMode('MQTT')} style={[styles.tab, mode === 'MQTT' && styles.activeTab]}>
            <Text>MQTT</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('AMQP')} style={[styles.tab, mode === 'AMQP' && styles.activeTab]}>
            <Text>AMQP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>Broker Host / URL</Text>
          <TextInput style={styles.input} value={brokerUrl} onChangeText={setBrokerUrl} autoCapitalize="none" />
          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
        </View>

        {mode === 'MQTT' ? (
          <View style={styles.group}>
            <Text style={styles.label}>MQTT Actions</Text>
            <View style={styles.row}>
              <Button title="Connect" onPress={handleMqttConnect} disabled={mqttConnected} />
              <Button title="Disconnect" onPress={() => ExpoMqtt.disconnect()} disabled={!mqttConnected} />
            </View>
            <Text style={styles.label}>Topic</Text>
            <TextInput style={styles.input} value={mqttTopic} onChangeText={setMqttTopic} autoCapitalize="none" />
            <View style={styles.row}>
              <Button title="Subscribe" onPress={() => ExpoMqtt.subscribe(mqttTopic, 0)} disabled={!mqttConnected} />
              <Button title="Unsubscribe" onPress={() => ExpoMqtt.unsubscribe(mqttTopic)} disabled={!mqttConnected} />
            </View>
            <Text style={styles.label}>Message</Text>
            <TextInput style={styles.input} value={mqttMessage} onChangeText={setMqttMessage} />
            <Button title="Publish" onPress={() => ExpoMqtt.publish(mqttTopic, mqttMessage)} disabled={!mqttConnected} />
          </View>
        ) : (
          <View style={styles.group}>
            <Text style={styles.label}>AMQP Actions</Text>
            <View style={styles.row}>
              <Button title="Connect" onPress={handleAmqpConnect} disabled={amqpConnected} />
              <Button title="Disconnect" onPress={() => ExpoAmqp.disconnect()} disabled={!amqpConnected} />
            </View>

            <Text style={styles.label}>Exchange</Text>
            <TextInput style={styles.input} value={amqpExchange} onChangeText={setAmqpExchange} autoCapitalize="none" />
            <Button title="Declare Exchange" onPress={() => ExpoAmqp.exchangeDeclare(amqpExchange, 'direct', true)} disabled={!amqpConnected} />

            <Text style={styles.label}>Queue</Text>
            <TextInput style={styles.input} value={amqpQueue} onChangeText={setAmqpQueue} autoCapitalize="none" />
            <Button title="Declare Queue" onPress={() => ExpoAmqp.queueDeclare(amqpQueue, true)} disabled={!amqpConnected} />

            <Text style={styles.label}>Routing Key</Text>
            <TextInput style={styles.input} value={amqpRoutingKey} onChangeText={setAmqpRoutingKey} autoCapitalize="none" />
            <Button title="Bind Queue" onPress={() => ExpoAmqp.queueBind(amqpQueue, amqpExchange, amqpRoutingKey)} disabled={!amqpConnected} />

            <Text style={styles.label}>Message</Text>
            <TextInput style={styles.input} value={amqpMessage} onChangeText={setAmqpMessage} />
            <Button title="Publish" onPress={() => ExpoAmqp.publish(amqpExchange, amqpRoutingKey, amqpMessage)} disabled={!amqpConnected} />

            <Button title="Consume Queue" onPress={() => ExpoAmqp.consume(amqpQueue)} disabled={!amqpConnected} />
          </View>
        )}

        <View style={styles.logs}>
          <Text style={styles.label}>Logs</Text>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logItem}>{log}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  group: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  label: { fontWeight: 'bold', marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 10, backgroundColor: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  logs: { marginTop: 20, paddingBottom: 20 },
  logItem: { paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#eee', fontSize: 12, fontFamily: 'monospace' },
  tabs: { flexDirection: 'row', marginBottom: 15, justifyContent: 'center' },
  tab: { padding: 10, borderWidth: 1, borderColor: '#ccc', flex: 1, alignItems: 'center', backgroundColor: '#eee' },
  activeTab: { backgroundColor: 'white', borderColor: '#007AFF', borderBottomWidth: 2 }
});
