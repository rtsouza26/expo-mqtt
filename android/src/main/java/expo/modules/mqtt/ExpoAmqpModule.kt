package expo.modules.mqtt

import com.rabbitmq.client.Channel
import com.rabbitmq.client.Connection
import com.rabbitmq.client.ConnectionFactory
import com.rabbitmq.client.DeliverCallback
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.nio.charset.StandardCharsets

class ExpoAmqpModule : Module() {
    private var connection: Connection? = null
    private var channel: Channel? = null

    override fun definition() = ModuleDefinition {
        Name("ExpoAmqp")

        Events("onAmqpConnect", "onAmqpDisconnect", "onAmqpMessage", "onAmqpError")

        AsyncFunction("connect") { options: Map<String, Any> ->
            try {
                val factory = ConnectionFactory()
                // Extract options with safe defaults or checks
                val uri = options["url"] as? String

                if (uri != null) {
                    factory.setUri(uri)
                } else {
                    // Fallback to individual fields if URI is not provided
                    factory.host = options["host"] as? String ?: "localhost"
                    factory.port = (options["port"] as? Number)?.toInt() ?: 5672
                    factory.username = options["username"] as? String ?: "guest"
                    factory.password = options["password"] as? String ?: "guest"
                    factory.virtualHost = options["virtualHost"] as? String ?: "/"
                }

                connection = factory.newConnection()
                channel = connection?.createChannel()

                sendEvent("onAmqpConnect", mapOf("success" to true))
            } catch (e: Exception) {
                e.printStackTrace()
                sendEvent("onAmqpError", mapOf("error" to (e.message ?: "Unknown connect error")))
                throw e
            }
        }

        AsyncFunction("disconnect") {
            try {
                channel?.close()
                connection?.close()
                channel = null
                connection = null
                sendEvent("onAmqpDisconnect", mapOf("manual" to true))
            } catch (e: Exception) {
                sendEvent(
                        "onAmqpError",
                        mapOf("error" to (e.message ?: "Unknown disconnect error"))
                )
            }
        }

        AsyncFunction("exchangeDeclare") { name: String, type: String, durable: Boolean ->
            try {
                channel?.exchangeDeclare(name, type, durable)
            } catch (e: Exception) {
                sendEvent("onAmqpError", mapOf("error" to (e.message ?: "Exchange declare error")))
                throw e
            }
        }

        AsyncFunction("queueDeclare") { name: String, durable: Boolean ->
            try {
                val result = channel?.queueDeclare(name, durable, false, false, null)
                result?.queue // Return the queue name (useful if allowing server-named queues)
            } catch (e: Exception) {
                sendEvent("onAmqpError", mapOf("error" to (e.message ?: "Queue declare error")))
                throw e
            }
        }

        AsyncFunction("queueBind") { queue: String, exchange: String, routingKey: String ->
            try {
                channel?.queueBind(queue, exchange, routingKey)
            } catch (e: Exception) {
                sendEvent("onAmqpError", mapOf("error" to (e.message ?: "Queue bind error")))
                throw e
            }
        }

        AsyncFunction("publish") { exchange: String, routingKey: String, message: String ->
            try {
                channel?.basicPublish(
                        exchange,
                        routingKey,
                        null,
                        message.toByteArray(StandardCharsets.UTF_8)
                )
            } catch (e: Exception) {
                sendEvent("onAmqpError", mapOf("error" to (e.message ?: "Publish error")))
                throw e
            }
        }

        AsyncFunction("consume") { queue: String ->
            try {
                val deliverCallback = DeliverCallback { consumerTag, delivery ->
                    val message = String(delivery.body, StandardCharsets.UTF_8)
                    val routingKey = delivery.envelope.routingKey
                    val exchange = delivery.envelope.exchange
                    sendEvent(
                            "onAmqpMessage",
                            mapOf(
                                    "queue" to queue,
                                    "message" to message,
                                    "routingKey" to routingKey,
                                    "exchange" to exchange
                            )
                    )
                }
                channel?.basicConsume(queue, true, deliverCallback) { consumerTag -> }
            } catch (e: Exception) {
                sendEvent("onAmqpError", mapOf("error" to (e.message ?: "Consume error")))
                throw e
            }
        }
    }
}
