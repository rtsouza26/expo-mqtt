package expo.modules.mqtt

import com.rabbitmq.client.*
import kotlinx.coroutines.*
import java.nio.charset.StandardCharsets

class RabbitService {
    private var connection: Connection? = null
    private var channel: Channel? = null
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    var onMessageReceived: ((String, String) -> Void)? = null
    var onStatusChanged: ((String) -> Void)? = null

    fun connect(url: String) {
        scope.launch {
            try {
                val factory = ConnectionFactory()
                factory.setUri(url)
                factory.requestedHeartbeat = 30
                
                connection = factory.newConnection()
                channel = connection?.createChannel()
                
                withContext(Dispatchers.Main) {
                    onStatusChanged?.invoke("Connected to $url")
                }
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
                withContext(Dispatchers.Main) {
                    onStatusChanged?.invoke("Disconnected")
                }
            } catch (e: Exception) {
                // Ignore
            }
        }
    }

    fun publish(exchangeName: String, routingKey: String, message: String, type: String) {
        scope.launch {
            try {
                channel?.exchangeDeclare(exchangeName, type, true)
                channel?.basicPublish(
                    exchangeName,
                    routingKey,
                    null,
                    message.toByteArray(StandardCharsets.UTF_8)
                )
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun declareExchange(name: String, type: String) {
        scope.launch {
            try {
                channel?.exchangeDeclare(name, type, true)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun consume(queueName: String) {
        scope.launch {
            try {
                channel?.queueDeclare(queueName, true, false, false, null)
                val consumer = object : DefaultConsumer(channel) {
                    override fun handleDelivery(
                        consumerTag: String,
                        envelope: Envelope,
                        properties: AMQP.BasicProperties,
                        body: ByteArray
                    ) {
                        val message = String(body, StandardCharsets.UTF_8)
                        onMessageReceived?.invoke(envelope.routingKey ?: queueName, message)
                    }
                }
                channel?.basicConsume(queueName, true, consumer)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
