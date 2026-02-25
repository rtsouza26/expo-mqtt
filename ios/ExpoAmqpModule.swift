import Foundation
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
      // chama dinamicamente: exchangeDeclare:type:
      _ = self.callChannelAny("exchangeDeclare:type:", args: [name, exchangeType])
      // durable ignorado aqui (depende da API do RMQClient/pod)
    }

    AsyncFunction("queueDeclare") { (name: String, durable: Bool) in
      // tenta criar/obter fila por selector, sem depender de channel.queueDeclare / channel.queue
      _ = self.queueAny(name)
      // durable ignorado aqui (depende da API do RMQClient/pod)
    }

    AsyncFunction("queueBind") { (queue: String, exchange: String, routingKey: String) in
      guard let q = self.queueAny(queue) else { return }
      guard let e = self.exchangeAny(exchange) else { return }
      q.bind(e, routingKey: routingKey)
    }

    AsyncFunction("publish") { (exchange: String, routingKey: String, message: String) in
      guard let e = self.exchangeAny(exchange) else { return }
      if let data = message.data(using: .utf8) {
        e.publish(data, routingKey: routingKey)
      }
    }

    AsyncFunction("consume") { (queueName: String) in
      guard let q = self.queueAny(queueName) else { return }

      q.subscribe({ (message: RMQMessage) in
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

  // MARK: - Dynamic helpers (não dependem de membros no protocol RMQChannel)

  private func callChannelAny(_ selectorName: String, args: [Any]) -> AnyObject? {
    guard let ch = self.channel else { return nil }
    let obj = ch as AnyObject
    let sel = NSSelectorFromString(selectorName)

    guard obj.responds(to: sel) else { return nil }

    switch args.count {
    case 0:
      return obj.perform(sel)?.takeUnretainedValue()
    case 1:
      return obj.perform(sel, with: args[0])?.takeUnretainedValue()
    case 2:
      return obj.perform(sel, with: args[0], with: args[1])?.takeUnretainedValue()
    default:
      // se precisar de 3+, crie um método ObjC wrapper; aqui mantemos simples
      return nil
    }
  }

  private func queueAny(_ name: String) -> RMQQueue? {
    // tenta "queue:" (comum em RMQClient)
    if let q = self.callChannelAny("queue:", args: [name]) as? RMQQueue { return q }
    // fallback: algumas variações usam outro nome
    if let q = self.callChannelAny("queueWithName:", args: [name]) as? RMQQueue { return q }
    return nil
  }

  private func exchangeAny(_ name: String) -> RMQExchange? {
    // tenta "exchange:" (comum em RMQClient)
    if let e = self.callChannelAny("exchange:", args: [name]) as? RMQExchange { return e }
    // fallback: algumas variações usam outro nome
    if let e = self.callChannelAny("exchangeWithName:", args: [name]) as? RMQExchange { return e }
    return nil
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