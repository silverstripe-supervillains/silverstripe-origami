<?php
require dirname(__DIR__) . '/vendor/autoload.php';

use Ratchet\Server\IoServer;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\WampServerInterface;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

/**
 * Supports SilverStripe > Angular communication over WebSockets.
 * Communication from Anuglar > SilverStripe is done over HTTP
 * because SilverStripe needs a request to bootstrap. (Not a loop like ReactPHP).
 *
 * Protocol
 * 	{
 *		"channel": "channel name",
 *		"body": {
 *			"whatever": "you want",
 *			"in here": 1
 *		},
 *		"socketId": 2 // optional - will send only to this socket.
 *	}
 */

/**
 * Vent between ZMQ and WS
 */
class Vent {
	public $ZMQSocket;
	public $WebSocket;

	public function sendToWebSocket($message) {

		// decode to get the socketId if it is set. (ZMQ handles strings)
		$message = json_decode($message);

		// if we have a socketId, send it if it exists
		if (isset($message->socketId)) {
			if (isset($this->WebSocket->clients[$message->socketId])) {
				$this->WebSocket->clients[$message->socketId]->send(json_encode($message));
			}
		// if no socketId, send to all sockets
		} else {
			foreach ($this->WebSocket->clients as $client) {
				// The sender is not the receiver, send to each client connected
				$client->send(json_encode($message));
			}
		}
	}

	public function registerWebSocket($socket) {
		$this->WebSocket = $socket;
	}

	public function registerZMQSocket($socket) {
		$this->ZMQSocket = $socket;
	}

}

/**
 * Handler class for the ZMQ server
 */
class ZMQSocketHandler implements WampServerInterface {
	public $vent;

	public function __construct($vent) {
		$this->vent = $vent;
		$this->vent->registerZMQSocket($this);
	}

	/**
	 * A lookup of all the topics clients have subscribed to
	 */
	protected $subscribedTopics = array();

	public function onSubscribe(ConnectionInterface $conn, $topic) {
		$this->subscribedTopics[$topic->getId()] = $topic;
	}

	public function onUnSubscribe(ConnectionInterface $conn, $topic) {
	}
	public function onOpen(ConnectionInterface $conn) {
	}
	public function onClose(ConnectionInterface $conn) {
	}
	public function onCall(ConnectionInterface $conn, $id, $topic, array $params) {
		// In this application if clients send data it's because the user hacked around in console
		$conn->callError($id, $topic, 'You are not allowed to make calls')->close();
	}
	public function onPublish(ConnectionInterface $conn, $topic, $event, array $exclude, array $eligible) {
		// In this application if clients send data it's because the user hacked around in console
		$conn->close();
	}
	public function onError(ConnectionInterface $conn, \Exception $e) {
	}

	public function handleMethod($var) {
		$this->vent->sendToWebSocket($var);
	}
}

/**
 * Handler class for this websocket server
 */
class WebSocketHandler implements MessageComponentInterface {
	public $clients;
	public $vent;

	public function __construct($vent) {
		$this->clients = array();
		$this->vent = $vent;
		$this->vent->registerWebSocket($this);
	}

	public function onOpen(ConnectionInterface $conn) {
		// Store the new connection to send messages to later
		$this->clients[$conn->resourceId] = $conn;

		$conn->send(json_encode(array(
            'channel' => 'onopen',
            'body' => array(),
            'socketId' => $conn->resourceId
        )));

		echo "New connection! ({$conn->resourceId})\n";
	}

	public function onMessage(ConnectionInterface $from, $msg) {

	}

	public function onClose(ConnectionInterface $conn) {
		// The connection is closed, remove it, as we can no longer send it messages
		unset($this->clients[$conn->resourceId]);

		echo "Connection {$conn->resourceId} has disconnected\n";
	}

	public function onError(ConnectionInterface $conn, \Exception $e) {
		echo "An error has occurred: {$e->getMessage()}\n";

		$conn->close();
	}
}

$vent = new Vent();

/**
 * Run the ZMQ server
 */
$loop   = React\EventLoop\Factory::create();

$context = new React\ZMQ\Context($loop);
$ZMQSocket = new ZMQSocketHandler($vent);
$pull = $context->getSocket(ZMQ::SOCKET_PULL);
$pull->bind('tcp://127.0.0.1:5555');
$pull->on('message', array($ZMQSocket, 'handleMethod'));

/**
 * Run the websocket server
 */
$webSock = new React\Socket\Server($loop);
$webSock->listen(8080, '0.0.0.0'); // Binding to 0.0.0.0 means remotes can connect
$webServer = new IoServer(
	new HttpServer(
		new WsServer(
			new WebSocketHandler($vent)
		)
	),
	$webSock
);

$loop->run();
