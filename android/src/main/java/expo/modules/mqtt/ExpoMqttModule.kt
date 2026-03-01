package expo.modules.mqtt

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoMqttModule : Module() {
  private val rabbitService = RabbitService()
  private val mqttService = MqttService()

  override fun definition() = ModuleDefinition {
    Name("ExpoMqtt")

    Events("onAmqpMessage", "onMqttMessage", "onAmqpStatus", "onMqttStatus")

    OnCreate {
      rabbitService.onMessageReceived = { queue, message ->
        sendEvent("onAmqpMessage", mapOf("queue" to queue, "message" to message))
      }
      rabbitService.onStatusChanged = { status ->
        sendEvent("onAmqpStatus", mapOf("status" to status))
      }

      mqttService.onMessageReceived = { topic, message ->
        sendEvent("onMqttMessage", mapOf("topic" to topic, "message" to message))
      }
      mqttService.onStatusChanged = { status ->
        sendEvent("onMqttStatus", mapOf("status" to status))
      }
    }

    // AMQP Functions
    AsyncFunction("amqpConnect") { url: String, username: String?, password: String? ->
      rabbitService.connect(url, username, password)
    }

    AsyncFunction("amqpDisconnect") { rabbitService.disconnect() }

    AsyncFunction("amqpPublish") {
            exchange: String,
            routingKey: String,
            message: String,
            type: String? ->
      rabbitService.publish(exchange, routingKey, message, type ?: "direct")
    }

    AsyncFunction("amqpDeclareExchange") { name: String, type: String ->
      rabbitService.declareExchange(name, type)
    }

    AsyncFunction("amqpConsume") { queue: String -> rabbitService.consume(queue) }

    // MQTT Functions
    AsyncFunction("mqttConnect") {
            host: String,
            port: Int,
            clientId: String,
            username: String?,
            password: String? ->
      mqttService.connect(host, port, clientId, username, password)
    }

    AsyncFunction("mqttDisconnect") { mqttService.disconnect() }

    AsyncFunction("mqttPublish") { topic: String, message: String ->
      mqttService.publish(topic, message)
    }

    AsyncFunction("mqttSubscribe") { topic: String -> mqttService.subscribe(topic) }
  }
}
