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
      let delegate = RMQConnectionDelegateLogger()

      if let uri = uri, !uri.isEmpty {
        self.connection = RMQConnection(uri: uri, delegate: delegate)
      } else {
        let user = options["username"] as? String ?? "guest"
        let pass = options["password"] as? String ?? "guest"
        let host = options["host"] as? String ?? "localhost"
        let port = options["port"] as? Int ?? 5672
        let vhost = options["virtualHost"] as? String ?? "/"

        let normalizedVhost = vhost.hasPrefix("/") ? vhost : "/" + vhost
        let constructedUri = "amqp://\(user):\(pass)@\(host):\(port)\(normalizedVhost)"
        self.connection = RMQConnection(uri: constructedUri, delegate: delegate)
      }

      self.connection?.start()
      self.channel = self.connection?.createChannel()

      self.sendEvent("onAmqpConnect", ["success": true])
    }

    AsyncFunction("disconnect") {
      self.connection?.close()
      self.connection = nil
      self.channel = nil
      self.sendEvent("onAmqpDisconnect", ["manual": true])
    }

    AsyncFunction("exchangeDeclare") { (name: String, type: String, durable: Bool) in
      let exchangeType = self.exchangeType(from: type)
      self.channel?.exchangeDeclare(name, type: exchangeType)
    }

    // ✅ compatível: não usa queueDeclare/declareQueue
    AsyncFunction("queueDeclare") { (name: String, durable: Bool) in
      _ = self.channel?.queue(name)
    }

    AsyncFunction("queueBind") { (queue: String, exchange: String, routingKey: String) in
      let q = self.channel?.queue(queue)
      let e = self.channel?.exchange(exchange)
      q?.bind(e, routingKey: routingKey)
    }

    AsyncFunction("publish") { (exchange: String, routingKey: String, message: String) in
      let e = self.channel?.exchange(exchange)
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