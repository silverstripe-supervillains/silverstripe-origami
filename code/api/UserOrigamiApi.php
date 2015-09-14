<?php
/**
 * Logged in user handler
 */
class UserOrigamiApi extends OrigamiApi {
	private static $allowed_actions = array (
		'login',
		'logout'
	);

	/**
	 * On user login, get user info and sitetree
	 */
	public function login($message = array()) {
		$socketSession = null;
		$data = $this->getMessage($message);

		$userdata = array();
		$response = array('success' => 1);
		try {
			$userdata = $this->getUserData();
		} catch (Exception $e) {
			// return failure
			$response['success'] = 0;
			$response['body'] = $e->getMessage();
		}

		if(count($userdata) > 0 && SocketSession::get()->filter('MemberID', $userdata['ID'])->count() > 0) {
			$socketSession = SocketSession::get()->filter('MemberID', $userdata['ID'])->First();
		} else {
			$socketSession = new SocketSession();
		}

		// setup SocketSession with relevant data
		$socketSession->MemberID = $userdata['ID'];
		$socketSession->SocketID = $this->getMessageSocketID($message);
		$socketSession->PageID = 0;
		$socketSession->write();

		SiteTreeOrigamiApi::emit_structure($data->socketId);
		ZMQInterface::emit('userdata', $userdata, $data->socketId);

		return $response;
	}

	/**
	 * Returns logged in user data
	 */
	public function getUserData($message = array()) {
		if($member = Member::currentUser()) {
			return array(
				'FirstName' => $member->FirstName,
				'Surname' => $member->Surname,
				'Email' => $member->Email,
				'ID' => $member->ID
			);
		} else {
			throw new Exception("UserOrigamiApi::getUserData Not logged in.");
		}
	}
	
	/**
	 * Logout current user
	 * Since the logout doesn't throw an error, we don't throw one either
	 */
	public function logout($message = array()) {
		if($member = Member::currentUser()) {
			$security = new Security();
			$security->logout(false);
		}
		
		return true;
	}
}
