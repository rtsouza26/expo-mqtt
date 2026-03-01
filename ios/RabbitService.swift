import Foundation
import RMQClient

class RabbitService: NSObject, RMQConnectionDelegate {
    private var connection: RMQConnection?
    private var channel: RMQChannel?
    
    var onMessageReceived: ((String, String) -> Void)?
    var onStatusChanged: ((String) -> Void)?

    func connect(url: String) {
        onStatusChanged?("Connecting...")
        
        // RMQConnection handles the URI parsing. 
        // We use a delegate to catch errors during handshake.
        connection = RMQConnection(uri: url, delegate: self)
        connection?.start()
        
        // We attempt to create a channel. In RMQClient, this can be done immediately;
        // it will be an 'unallocated' channel until the connection handshakes.
        channel = connection?.createChannel()
        
        // Note: Creating the channel doesn't mean it's 'open' yet.
        // Handshake happens in the background.
        onStatusChanged?("Connection started. Waiting for handshake...")
    }

    func disconnect() {
        connection?.close()
        channel = nil
        onStatusChanged?("Disconnected")
    }

    func publish(exchangeName: String, routingKey: String, message: String, type: String = "direct") {
        guard let conn = connection, conn.isOpen() else {
            onStatusChanged?("Error: Connection is not open.")
            return
        }
        
        guard let ch = channel, ch.isOpen() else {
            onStatusChanged?("Error: Channel is not open. Try again in a moment.")
            return
        }

        let data = message.data(using: .utf8) ?? Data()
        
        if exchangeName.isEmpty {
            ch.defaultExchange().publish(data, routingKey: routingKey)
            onStatusChanged?("Published to default exchange (\(routingKey))")
        } else {
            let exchange = getExchange(name: exchangeName, type: type)
            exchange.publish(data, routingKey: routingKey)
            onStatusChanged?("Published to exchange: \(exchangeName) (\(type))")
        }
    }

    func declareExchange(name: String, type: String) {
        guard let ch = channel, ch.isOpen() else {
            onStatusChanged?("Error: Channel is not open. Cannot declare exchange.")
            return
        }
        _ = getExchange(name: name, type: type)
        onStatusChanged?("Exchange declared: \(name) (\(type))")
    }

    private func getExchange(name: String, type: String) -> RMQExchange {
        guard let ch = channel else { fatalError("Channel is nil") }
        
        switch type {
        case "fanout":
            return ch.fanout(name, options: .durable)
        case "topic":
            return ch.topic(name, options: .durable)
        case "headers":
            return ch.headers(name, options: .durable)
        default:
            return ch.direct(name, options: .durable)
        }
    }

    func consume(queueName: String) {
        guard let ch = channel, ch.isOpen() else {
            onStatusChanged?("Error: Channel is not open. Cannot consume.")
            return
        }
        
        let queue = ch.queue(queueName, options: .durable)
        queue.subscribe({ message in
            if let body = String(data: message.body, encoding: .utf8) {
                print("Received message: \(body)")
                self.onMessageReceived?(queueName, body)
            }
        })
        onStatusChanged?("Consuming from: \(queueName)")
    }

    // MARK: - RMQConnectionDelegate methods

    func connection(_ connection: RMQConnection, failedToConnectWithError error: Error) {
        onStatusChanged?("Connection Failed: \(error.localizedDescription)")
    }

    func connection(_ connection: RMQConnection, disconnectedWithError error: Error) {
        onStatusChanged?("Disconnected with error: \(error.localizedDescription)")
    }

    func channel(_ channel: RMQChannel, error: Error) {
        onStatusChanged?("Channel Error: \(error.localizedDescription)")
    }

    func willStartRecovery(with connection: RMQConnection) {
        onStatusChanged?("Connection lost. Starting recovery...")
    }

    func startingRecovery(with connection: RMQConnection) {
        onStatusChanged?("Recovering...")
    }

    func recoveredConnection(_ connection: RMQConnection) {
        onStatusChanged?("Connection recovered.")
        // Re-create channel if needed or RMQClient might handle it
        self.channel = connection.createChannel()
    }
}
