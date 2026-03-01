package expo.modules.mqtt

import com.rabbitmq.client.*
import java.nio.charset.StandardCharsets
import kotlinx.coroutines.*

class RabbitService {
    private var connection: Connection? = null
    private var channel: Channel? = null
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    var onMessageReceived: ((String, String) -> Unit)? = null
    var onStatusChanged: ((String) -> Unit)? = null

    fun connect(url: String, username: String? = null, password: String? = null) {
        scope.launch {
            try {
                val factory = ConnectionFactory()
                factory.setUri(url)
                if (username != null) factory.username = username
                if (password != null) factory.password = password
                factory.requestedHeartbeat = 30

                connection = factory.newConnection()
                channel = connection?.createChannel()

                withContext(Dispatchers.Main) { onStatusChanged?.invoke("Connected to $url") }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    onStatusChanged?.invoke("Connection failed: ${e.message}")
                }
            }
        }
    }

    fun disconnect() {
        scope.launch {
            try {
                channel?.close()
                connection?.close()
                withContext(Dispatchers.Main) { onStatusChanged?.invoke("Disconnected") }
            } catch (e: Exception) {
                // Ignore
            }
        }
    }

    fun publish(exchangeName: String, routingKey: String, message: String, type: String) {
        scope.launch {
            try {
                val ch = channel ?: throw Exception("Channel is not open")
                if (!ch.isOpen) throw Exception("Channel is closed")

                if (exchangeName.isNotEmpty()) {
                    ch.exchangeDeclare(exchangeName, type, true)
                }

                ch.basicPublish(
                        exchangeName,
                        routingKey,
                        null,
                        message.toByteArray(StandardCharsets.UTF_8)
                )
                withContext(Dispatchers.Main) {
                    onStatusChanged?.invoke("Message published to $exchangeName ($routingKey)")
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    onStatusChanged?.invoke("Publish failed: ${e.message}")
                }
            }
        }
    }

    fun declareExchange(name: String, type: String) {
        scope.launch {
            try {
                val ch = channel ?: throw Exception("Channel is not open")
                ch.exchangeDeclare(name, type, true)
                withContext(Dispatchers.Main) {
                    onStatusChanged?.invoke("Exchange declared: $name ($type)")
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    onStatusChanged?.invoke("Exchange declaration failed: ${e.message}")
                }
            }
        }
    }

    fun consume(queueName: String) {
        scope.launch {
            try {
                val ch = channel ?: throw Exception("Channel is not open")
                ch.queueDeclare(queueName, true, false, false, null)
                val consumer =
                        object : DefaultConsumer(ch) {
                            override fun handleDelivery(
                                    consumerTag: String,
                                    envelope: Envelope,
                                    properties: AMQP.BasicProperties,
                                    body: ByteArray
                            ) {
                                val message = String(body, StandardCharsets.UTF_8)
                                scope.launch(Dispatchers.Main) {
                                    onMessageReceived?.invoke(
                                            envelope.routingKey ?: queueName,
                                            message
                                    )
                                }
                            }
                        }
                ch.basicConsume(queueName, true, consumer)
                withContext(Dispatchers.Main) {
                    onStatusChanged?.invoke("Started consuming from $queueName")
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    onStatusChanged?.invoke("Consume failed: ${e.message}")
                }
            }
        }
    }
}
