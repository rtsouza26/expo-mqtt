import ExpoModulesCore
import CocoaMQTT

public class ExpoMqttModule: Module, CocoaMQTTDelegate {
  private var mqtt: CocoaMQTT?
  
  public func definition() -> ModuleDefinition {
    Name("ExpoMqtt")
    
    Events("onConnect", "onDisconnect", "onMessage", "onError")
    
    AsyncFunction("connect") { (options: [String: Any]) in
      guard let urlString = options["url"] as? String,
            let url = URL(string: urlString),
            let host = url.host,
            let port = url.port else {
        throw Exception(name: "InvalidURL", description: "Invalid URL provided. Must include host and port.")
      }
      
      let clientId = options["clientId"] as? String ?? "ExpoMqtt-\(UUID().uuidString)"
      let mqtt = CocoaMQTT(clientID: clientId, host: host, port: UInt16(port))
      
      if let username = options["username"] as? String {
          mqtt.username = username
      }
      
      if let password = options["password"] as? String {
          mqtt.password = password
      }
      
      mqtt.keepAlive = 60
      mqtt.delegate = self
      
      let success = mqtt.connect()
      if success {
          self.mqtt = mqtt
      } else {
          throw Exception(name: "ConnectFailed", description: "Failed to initiate connection")
      }
    }
    
    AsyncFunction("disconnect") {
      self.mqtt?.disconnect()
      // Event will be fired by delegate
    }
    
    AsyncFunction("subscribe") { (topic: String, qos: Int) in
      self.mqtt?.subscribe(topic, qos: CocoaMQTTQoS(rawValue: UInt8(qos)) ?? .qos1)
    }
    
    AsyncFunction("unsubscribe") { (topic: String) in
      self.mqtt?.unsubscribe(topic)
    }
    
    AsyncFunction("publish") { (topic: String, message: String) in
      self.mqtt?.publish(topic, withString: message)
    }
  }
  
  // MARK: - CocoaMQTTDelegate
  
  public func mqtt(_ mqtt: CocoaMQTT, didConnectAck ack: CocoaMQTTConnAck) {
    if ack == .accept {
      sendEvent("onConnect", ["success": true])
    } else {
      sendEvent("onError", ["error": "Connection failed with ack: \(ack)"])
    }
  }
  
  public func mqtt(_ mqtt: CocoaMQTT, didPublishMessage message: CocoaMQTTMessage, id: UInt16) {
    // published
  }
  
  public func mqtt(_ mqtt: CocoaMQTT, didPublishAck id: UInt16) {
    // published ack
  }
  
  public func mqtt(_ mqtt: CocoaMQTT, didReceiveMessage message: CocoaMQTTMessage, id: UInt16) {
    sendEvent("onMessage", [
      "topic": message.topic,
      "message": message.string ?? ""
    ])
  }
  
  public func mqtt(_ mqtt: CocoaMQTT, didSubscribeTopics success: NSDictionary, failed: [String]) {
    // subscribed
  }
  
  public func mqtt(_ mqtt: CocoaMQTT, didUnsubscribeTopics topics: [String]) {
    // unsubscribed
  }
  
  public func mqttDidPing(_ mqtt: CocoaMQTT) {
    // ping
  }
  
  public func mqttDidReceivePong(_ mqtt: CocoaMQTT) {
    // pong
  }
  
  public func mqttDidDisconnect(_ mqtt: CocoaMQTT, withError err: Error?) {
    sendEvent("onDisconnect", ["cause": err?.localizedDescription])
  }
}
