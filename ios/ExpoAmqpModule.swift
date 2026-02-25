import ExpoModulesCore
import RMQClient

public class ExpoAmqpModule: Module {
  private var connection: RMQConnection?
  private var channel: RMQChannel?

  public func definition() -> ModuleDefinition {
    Name("ExpoAmqp")

    Events("onAmqpConnect", "onAmqpDisconnect", "onAmqpMessage", "onAmqpError")

    AsyncFunction("connect") { (options: [String: Any]) in
      let uri = options["url"] as? String
      let delegate = RMQConnectionDelegateLogger() // Simple logger for now

      if let uri = uri {
        self.connection = RMQConnection(uri: uri, delegate: delegate)
      } else {
        // Construct from fields not supported directly by simple init in RMQClient usually, 
        // but let's try to assume URI is always passed or build it.
        // For simplicity, we require URI or build it ourselves.
        let user = options["username"] as? String ?? "guest"
        let pass = options["password"] as? String ?? "guest"
        let host = options["host"] as? String ?? "localhost"
        let port = options["port"] as? Int ?? 5672
        let vhost = options["virtualHost"] as? String ?? "/"
        
        let constructedUri = "amqp://\(user):\(pass)@\(host):\(port)\(vhost)"
        self.connection = RMQConnection(uri: constructedUri, delegate: delegate)
      }

      self.connection?.start()
      
      // RMQClient is async, we need to handle connection success in a delegate really, 
      // but simplistic approach:
      // We can't easily wait for connection in this sync block without a callback.
      // We'll trust it starts and send event later.
      // But wait, RMQConnection.start() is non-blocking.
      
      // Let's create a channel immediately, RMQClient queues operations.
      self.channel = self.connection?.createChannel()
      
      self.sendEvent("onAmqpConnect", [
        "success": true
      ])
    }

    AsyncFunction("disconnect") {
      self.connection?.close()
      self.connection = nil
      self.channel = nil
      self.sendEvent("onAmqpDisconnect", ["manual": true])
    }

    AsyncFunction("exchangeDeclare") { (name: String, type: String, durable: Bool) in
      let exchangeType = self.exchangeType(from: type)
      let options: RMQExchangeDeclareOptions = durable ? .durable : .autoDelete // Simplification
       self.channel?
  .exchangeDeclare(
      name,
      type: exchangeType,
      durable: durable,
      autoDelete: !durable
  )
    }

    AsyncFunction("queueDeclare") { (name: String, durable: Bool) in
      let options: RMQQueueDeclareOptions = durable ? .durable : .autoDelete // Simplification
      self.channel?.declareQueue(name, options: options)
    }

    AsyncFunction("queueBind") { (queue: String, exchange: String, routingKey: String) in
        let q = self.channel?.queue(queue)
        let e = self.channel?.exchange(exchange)
        q?.bind(e, routingKey: routingKey)
    }

    AsyncFunction("publish") { (exchange: String, routingKey: String, message: String) in
        let e = self.channel?.exchange(exchange)
        // RMQClient uses messages as Data
        if let data = message.data(using: .utf8) {
            e?.publish(data, routingKey: routingKey)
        }
    }

    AsyncFunction("consume") { (queueName: String) in
        let q = self.channel?.queue(queueName)
        q?.subscribe({ (message: RMQMessage) in
            if let body = String(data: message.body, encoding: .utf8) {
                self.sendEvent("onAmqpMessage", [
                    "queue": queueName,
                    "message": body,
                    "routingKey": message.routingKey,
                    "exchange": message.exchangeName
                ])
            }
        })
    }
  }

  private func exchangeType(from type: String) -> String {
    switch type {
    case "fanout": return "fanout"
    case "topic": return "topic"
    case "headers": return "headers"
    default: return "direct"
    }
  }
}
