<?php
/**
 * Basic handler for API calls from angular-origami
 */
class OrigamiApi extends Controller {

	protected static $tree_class = "SiteTree";

	private static $allowed_actions = array (
		'get',
		'process'
	);

	/**
	 * Default to the `Stage` (draft) version of objects
	 */
	public function init() {
		parent::init();
		Versioned::reading_stage('Stage');
	}

	/**
	 * Return a single page as an array object for use on the frontend in the Origami application.
	 * @return Array
	 */
	public function get($message = array()) {
		// setup the default response
		$response = array(
			'success' => 0,
			'body' => 'Error'
		);

		// get the page
		$data = $this->getMessageBody($message);
		$pageId = $data->pageId;
		$record = $this->getRecord($pageId);

		try {
			// page doesn't exist handler
			if(!$record->exists()) {
				throw new Exception("Page does not exist.");
			}

			// permissions handler
			if(!$record->canView()) {
				throw new Exception("You do not have permission to view this page.");
			}

			// return success
			$response['success'] = 1;
			$response['body'] = array();
			$response['body']['fields'] = $record->getCMSFieldsSchema();
			$response['body']['actions'] = $record->getCMSActionsSchema();
			$response['body']['breadcrumbs'] = $record->getBreadcrumbsSchema();

			// emit to all current users a new user is joining
			$this->emitPageUsers($message, $pageId);
		} catch (Exception $e) {
			// return failure
			$response['success'] = 0;
			$response['body'] = $e->getMessage();
		}

		return json_encode($response);
	}

	/**
	 * Process a form action.
	 * @example `action_save` will call the `save` method on the controller (or the child controller).
	 * @see ffFormActionDirective.es6
	 */
	public function process($message = array()) {
		// setup the default response
		$response = array(
			'success' => 0,
			'body' => 'Error'
		);

		try {
			// get the action to call
			$data = $this->getMessageBody($message);
			$action = $this->formatAction($data->action);

			// method doesn't exist handler
			if(!method_exists($this, $action)) {
				throw new Exception("Method does not exist.");
			}

			// return success
			$response['success'] = 1;
			$response['body'] = $this->$action($data);
		} catch (Exception $e) {
			// return failure
			$response['success'] = 0;
			$response['body'] = $e->getMessage();
		}

		return json_encode($response);
	}

	/**
	 * Let users know when another user joins their page in the Origami CMS
	 */
	public function emitPageUsers($message, $pageId) {
		$socketId = $this->getMessageSocketID($message);

		// update current socket session
		$session = SocketSession::get()->filter('SocketID', $socketId)->first();
		// failsafe
		if(!$session || !$session->exists()) {
			$session = new SocketSession();
			$session->MemberID = Member::currentUserID();
			$session->SocketID = $socketId;
		}
		$session->PageID = $pageId;
		$session->write();

		// check if there are any users that need to be notified
		$users = SocketSession::get()->filter('PageID', $pageId);
		if($users->count() > 0) {

			// getting data from member to display nicely
			$mapUsers = $users->column('MemberID');
			$mapUsers = Member::get()->filter('ID', $mapUsers);

			$members = array();
			foreach($mapUsers as $user) {
				$members[$user->ID] = array(
					'id' => $user->ID,
					'firstname' => $user->FirstName,
					'initials' => substr($user->FirstName, 0, 1) . substr($user->Surname, 0, 1)
				);
			}

			foreach ($users as $user) {
				$copy = $members;
				// remove user that the socket id belongs to from the list
				if(isset($copy[$user->MemberID])) {
					unset($copy[$user->MemberID]);
				}

				if(count($copy) > 0) {
					ZMQInterface::emit('editform/view', array('Members' => $copy), $user->SocketID);
				}
			}
		}
	}

	/**
	 * Return a dataobject based on the `id` and `tree_class`.
	 *
	 * @param  int $id
	 * @return DataObject
	 */
	public function getRecord($id) {
		$treeClass = $this->stat('tree_class');
		$record = DataObject::get_one($treeClass, "\"$treeClass\".\"ID\" = $id");

		// Then, try getting a record from the live site
		if(!$record) {
			Versioned::reading_stage('Live');
			singleton($treeClass)->flushCache();

			$record = DataObject::get_one( $treeClass, "\"$treeClass\".\"ID\" = $id");
			if($record) Versioned::set_reading_mode('');
		}

		// Then, try getting a deleted record
		if(!$record) {
			$record = Versioned::get_latest_version($treeClass, $id);
		}

		return $record;
	}
	
	/**
	 * Format an action from 'action_save' to 'save' to match the method.
	 *
	 * @param  string $action
	 * @return string
	 */
	protected function formatAction($action) {
		return str_replace('action_', '', $action);
	}
	
	/**
	 * Wrapper for updating sitetree functionality,
	 * it's called on almost every action of an edit page form
	 */
	protected function updateSiteTree($record, $socketId = null) {
		// if it's a sitetree page then reset the sitetree cache
		// and re emit the sitetree refresh
		SiteTreeOrigamiApi::reset_cache();
		SiteTreeOrigamiApi::emit_structure($socketId, $record);
	}

	protected function getMessage($message) {
		$body = $message->getBody();
		$body = json_decode($body);
		return $body;
	}

	protected function getMessageBody($message) {
		if(isset($this->getMessage($message)->body)) {
			return $this->getMessage($message)->body;
		} else {
			return $this->getMessage($message);
		}
	}

	protected function getMessageSocketID($message) {
		if(isset($this->getMessage($message)->socketId)) {
			return $this->getMessage($message)->socketId;
		} else {
			return $this->getMessage($message);
		}
	}

	/*******************************
	 * FORM ACTION METHODS
	 *******************************/

	/**
	 * Save a record by schema.
	 * @param  Array 		$data
	 * @return String
	 */
	public function save($data) {
		// format data and get the page
		$pageId = $data->pageId;
		$record = $this->getRecord($pageId);
		$fields = $data->fields;
		$schema = json_decode(json_encode($fields), true);

		// page doesn't exist handler
		if(!$record->exists()) {
			throw new Exception("Page does not exist.");
		}
		
		try {
			$result = $record->setCMSFieldsFromSchema($schema, false);
			$this->updateSiteTree($record);
			return $result;
		} catch (Exception $e) {
			throw new Exception($e->getMessage());
		}
	}
}