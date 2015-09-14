<?php
class SocketSession extends DataObject {

	private static $db = array(
		'SocketID' => 'Int'
	);

	private static $has_one = array(
		'Member' => 'Member',
		'Page' => 'Page'
	);

}