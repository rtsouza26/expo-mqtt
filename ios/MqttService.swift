import Foundation
import CocoaMQTT

class MqttService: NSObject, CocoaMQTTDelegate {
    private var mqtt: CocoaMQTT?
    
    var onMessageReceived: ((String, String) -> Void)?
    var onStatusChanged: ((String) -> Void)?

    func connect(host: String, port: UInt16, clientId: String, username: String? = nil, password: String? = nil) {
        mqtt = CocoaMQTT(clientID: clientId, host: host, port: port)
        mqtt?.username = username
        mqtt?.password = password
        mqtt?.delegate = self
        _ = mqtt?.connect()
    }

    func disconnect() {
        mqtt?.disconnect()
    }

    func publish(topic: String, message: String) {
        mqtt?.publish(topic, withString: message)
    }

    func subscribe(topic: String) {
        mqtt?.subscribe(topic)
    }

    // MARK: - CocoaMQTTDelegate
    func mqtt(_ mqtt: CocoaMQTT, didConnectAck ack: CocoaMQTTConnAck) {
        onStatusChanged?("Connected to \(mqtt.host)")
    }

    func mqtt(_ mqtt: CocoaMQTT, didReceiveMessage message: CocoaMQTTMessage, id: UInt16) {
        if let body = message.string {
            onMessageReceived?(message.topic, body)
        }
    }

    func mqtt(_ mqtt: CocoaMQTT, didPublishMessage message: CocoaMQTTMessage, id: UInt16) {}
    func mqtt(_ mqtt: CocoaMQTT, didPublishAck id: UInt16) {}
    func mqtt(_ mqtt: CocoaMQTT, didSubscribeTopics success: NSDictionary, failed: [String]) {}
    func mqtt(_ mqtt: CocoaMQTT, didUnsubscribeTopics topics: [String]) {}
    func mqttDidPing(_ mqtt: CocoaMQTT) {}
    func mqttDidReceivePong(_ mqtt: CocoaMQTT) {}
    func mqttDidDisconnect(_ mqtt: CocoaMQTT, withError err: Error?) {
        onStatusChanged?("Disconnected: \(err?.localizedDescription ?? "No error")")
    }
}
