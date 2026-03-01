package expo.modules.mqtt

import kotlinx.coroutines.*
import org.eclipse.paho.client.mqttv3.*
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence

class MqttService {
    private var mqttClient: MqttAsyncClient? = null
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    var onMessageReceived: ((String, String) -> Void)? = null
    var onStatusChanged: ((String) -> Void)? = null

    fun connect(
            host: String,
            port: Int,
            clientId: String,
            username: String? = null,
            password: String? = null
    ) {
        scope.launch {
            try {
                val serverUri = "tcp://$host:$port"
                mqttClient = MqttAsyncClient(serverUri, clientId, MemoryPersistence())

                val options = MqttConnectOptions()
                options.isCleanSession = true
                if (username != null) {
                    options.userName = username
                }
                if (password != null) {
                    options.password = password.toCharArray()
                }

                mqttClient?.setCallback(
                        object : MqttCallback {
                            override fun connectionLost(cause: Throwable?) {
                                scope.launch(Dispatchers.Main) {
                                    onStatusChanged?.invoke("Connection lost: ${cause?.message}")
                                }
                            }

                            override fun messageArrived(topic: String?, message: MqttMessage?) {
                                scope.launch(Dispatchers.Main) {
                                    onMessageReceived?.invoke(
                                            topic ?: "",
                                            message?.toString() ?: ""
                                    )
                                }
                            }

                            override fun deliveryComplete(token: IMqttDeliveryToken?) {}
                        }
                )

                mqttClient?.connect(
                        options,
                        null,
                        object : IMqttActionListener {
                            override fun onSuccess(asyncActionToken: IMqttToken?) {
                                scope.launch(Dispatchers.Main) {
                                    onStatusChanged?.invoke("Connected to $serverUri")
                                }
                            }

                            override fun onFailure(
                                    asyncActionToken: IMqttToken?,
                                    exception: Throwable?
                            ) {
                                scope.launch(Dispatchers.Main) {
                                    onStatusChanged?.invoke(
                                            "Connection failed: ${exception?.message}"
                                    )
                                }
                            }
                        }
                )
            } catch (e: Exception) {
                withContext(Dispatchers.Main) { onStatusChanged?.invoke("Error: ${e.message}") }
            }
        }
    }

    fun disconnect() {
        scope.launch {
            try {
                mqttClient?.disconnect()
                withContext(Dispatchers.Main) { onStatusChanged?.invoke("Disconnected") }
            } catch (e: Exception) {
                // Ignore
            }
        }
    }

    fun publish(topic: String, message: String) {
        scope.launch {
            try {
                val mqttMessage = MqttMessage(message.toByteArray())
                mqttClient?.publish(topic, mqttMessage)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun subscribe(topic: String) {
        scope.launch {
            try {
                mqttClient?.subscribe(topic, 1)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
