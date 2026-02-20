package expo.modules.mqtt

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken
import org.eclipse.paho.client.mqttv3.MqttCallback
import org.eclipse.paho.client.mqttv3.MqttClient
import org.eclipse.paho.client.mqttv3.MqttConnectOptions
import org.eclipse.paho.client.mqttv3.MqttMessage
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence
import java.util.UUID

class ExpoMqttModule : Module() {
  private var mqttClient: MqttClient? = null

  override fun definition() = ModuleDefinition {
    Name("ExpoMqtt")

    Events("onConnect", "onDisconnect", "onMessage", "onError")

    AsyncFunction("connect") { options: Map<String, Any> ->
      val brokerUrl = options["url"] as? String ?: throw Exception("URL is required")
      val clientId = options["clientId"] as? String ?: UUID.randomUUID().toString()
      val username = options["username"] as? String
      val password = options["password"] as? String
      
      try {
        mqttClient = MqttClient(brokerUrl, clientId, MemoryPersistence())
        val connectOptions = MqttConnectOptions()
        if (username != null) connectOptions.userName = username
        if (password != null) connectOptions.password = password.toCharArray()
        connectOptions.isCleanSession = true
        
        mqttClient?.setCallback(object : MqttCallback {
          override fun connectionLost(cause: Throwable?) {
            sendEvent("onDisconnect", mapOf("cause" to cause?.message))
          }

          override fun messageArrived(topic: String?, message: MqttMessage?) {
            sendEvent("onMessage", mapOf(
              "topic" to topic,
              "message" to message?.toString()
            ))
          }

          override fun deliveryComplete(token: IMqttDeliveryToken?) {
            // Not used for now
          }
        })

        mqttClient?.connect(connectOptions)
        sendEvent("onConnect", mapOf("success" to true))
      } catch (e: Exception) {
        sendEvent("onError", mapOf("error" to e.message))
        throw e
      }
    }

    AsyncFunction("disconnect") {
      try {
        mqttClient?.disconnect()
        sendEvent("onDisconnect", mapOf("manual" to true))
      } catch (e: Exception) {
        throw e
      }
    }

    AsyncFunction("subscribe") { topic: String, qos: Int ->
      mqttClient?.subscribe(topic, qos)
    }

    AsyncFunction("unsubscribe") { topic: String ->
      mqttClient?.unsubscribe(topic)
    }

    AsyncFunction("publish") { topic: String, message: String ->
      val mqttMessage = MqttMessage(message.toByteArray())
      mqttClient?.publish(topic, mqttMessage)
    }
  }
}
