import ExpoModulesCore

public class ExpoMqttModule: Module {
  private let rabbitService = RabbitService()
  private let mqttService = MqttService()

  public func definition() -> ModuleDefinition {
    Name("ExpoMqtt")

    Events("onAmqpMessage", "onMqttMessage", "onAmqpStatus", "onMqttStatus")

    OnCreate {
      self.rabbitService.onMessageReceived = { queue, message in
        self.sendEvent("onAmqpMessage", [
          "queue": queue,
          "message": message
        ])
      }
      self.rabbitService.onStatusChanged = { status in
        self.sendEvent("onAmqpStatus", ["status": status])
      }

      self.mqttService.onMessageReceived = { topic, message in
        self.sendEvent("onMqttMessage", [
          "topic": topic,
          "message": message
        ])
      }
      self.mqttService.onStatusChanged = { status in
        self.sendEvent("onMqttStatus", ["status": status])
      }
    }

    // AMQP Functions
    AsyncFunction("amqpConnect") { (url: String, username: String?, password: String?) in
      self.rabbitService.connect(url: url, username: username, password: password)
    }

    AsyncFunction("amqpDisconnect") {
      self.rabbitService.disconnect()
    }

    AsyncFunction("amqpPublish") { (exchange: String, routingKey: String, message: String, type: String?) in
      self.rabbitService.publish(exchangeName: exchange, routingKey: routingKey, message: message, type: type ?? "direct")
    }

    AsyncFunction("amqpDeclareExchange") { (name: String, type: String) in
      self.rabbitService.declareExchange(name: name, type: type)
    }

    AsyncFunction("amqpConsume") { (queue: String) in
      self.rabbitService.consume(queueName: queue)
    }

    // MQTT Functions
    AsyncFunction("mqttConnect") { (host: String, port: Int, clientId: String, username: String?, password: String?) in
      self.mqttService.connect(host: host, port: UInt16(port), clientId: clientId, username: username, password: password)
    }

    AsyncFunction("mqttDisconnect") {
      self.mqttService.disconnect()
    }

    AsyncFunction("mqttPublish") { (topic: String, message: String) in
      self.mqttService.publish(topic: topic, message: message)
    }

    AsyncFunction("mqttSubscribe") { (topic: String) in
      self.mqttService.subscribe(topic: topic)
    }
  }
}
