<?php

class ZMQInterface {
	public static function emit($channel, $body = null, String $socketId=null) {
		$JSON = array(
			'channel'  => $channel,
			'body'     => $body,
			'socketId' => $socketId
		);

		$context = new ZMQContext();
		$socket = $context->getSocket(ZMQ::SOCKET_PUSH);
		$socket->connect("tcp://127.0.0.1:5555");

		return $socket->send(json_encode($JSON));
	}
	
	public function on($channel) {}
}
