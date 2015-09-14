<?php
/**
 * All responses should be in the following format:
 * array(
 * 	"success" => Boolean,
 * 	"body" => String|Array
 * )
 */
class EditFormOrigamiApi extends OrigamiApi {

	protected static $tree_class = "SiteTree";

	private static $allowed_actions = array(
		'leave'
	);

	/**
	 * Set the current SocketSession PageID back to null
	 * and then let users know current user is leaving the page
	 * @param SS_HTTPRequst $message
	 * @return void
	 */
	public function leave($message) {
		$data = $this->getMessageBody($message);
		$pageId = $data->pageId;
		$socketId = $this->getMessageSocketID($message);

		// update current socket session
		$session = SocketSession::get()->filter('SocketID', $socketId)->first();
		// failsafe
		if(!$session || !$session->exists()) {
			$session = new SocketSession();
			$session->MemberID = Member::currentUserID();
			$session->SocketID = $socketId;
		}
		$session->PageID = null;
		$session->write();

		$this->emitUserLeaving($socketId, $pageId, $session->Member());
	}

	/**
	 * Let users know when another user leaves their page in the Origami CMS
	 */
	public function emitUserLeaving($socketId, $pageId, $member) {
		// check if there are any users that need to be notified
		$users = SocketSession::get()->filter('PageID', $pageId)->exclude('MemberID', $member->ID);
		if($users->count() > 0) {
			foreach ($users as $user) {
				ZMQInterface::emit(
					'editform/leave',
					array(
						'MemberID' => $member->ID,
						'MemberFirstName' => $member->FirstName
					),
					$user->SocketID
				);
			}
		}
	}

	private function clearSessionPage($socketSession = null) {
		if($socketSession) {

		}
	}

	/*******************************
	 * FORM ACTION METHODS
	 *******************************/

	/**
	 * Save and publish a record by schema.
	 * @param  DataObject 	$record
	 * @param  Array 		$schema
	 * @return String
	 */
	public function publish($data) {
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
			$result = $record->setCMSFieldsFromSchema($schema, true);
			$this->updateSiteTree($record);
			return $result;
		} catch (Exception $e) {
			throw new Exception($e->getMessage());
		}
	}

	/**
	 * Unpublish a record by schema.
	 * @param  DataObject 	$record
	 * @return String
	 */
	public function unpublish($data) {
		// format data and get the page
		$pageId = $data->pageId;
		$record = $this->getRecord($pageId);

		if(!$record || !$record->exists()) {
			throw new Exception('Page doesn\'t exists');
		}

		if($record->doUnpublish()) {
			$this->updateSiteTree($record);
			return "Page successfully unpublished.";
		} else {
			return "Error unpublishing page.";
		}
	}

	/**
	 * Delete from draft.
	 * @param  DataObject 	$record
	 * @return String
	 */
	public function delete($data) {
		// format data and get the page
		$pageId = $data->pageId;
		$record = $this->getRecord($pageId);

		if(!$record || !$record->exists()) {
			throw new Exception('Page doesn\'t exists');
		}

		try {
			$record->deleteFromStage('Stage');
			$this->updateSiteTree($record);
			return "Page successfully deleted from draft.";
		} catch (Exception $e) {
			return "Error deleting the page.";
		}
	}

	/**
	 * Restores a page back after deleting the draft.
	 * Main functionality taken from CMSMain::revert($data, $form)
	 * @param  DataObject 	$record
	 * @return String
	 */
	public function revert($data) {
		// format data and get the page
		$pageId = $data->pageId;
		$record = $this->getRecord($pageId);
		$treeClass = $this->stat('tree_class');

		if(!$record || !$record->exists()) {
			throw new Exception('Page doesn\'t exists');
		}

		$record = Versioned::get_one_by_stage(
			$treeClass,
			'Live',
			sprintf("\"%s_Live\".\"ID\" = '%d'", $treeClass, (int)$pageId)
		);

		// a user can restore a page without publication rights, as it just adds a new draft state
		// (this action should just be available when page has been "deleted from draft")
		if($record && !$record->canEdit()) return Security::permissionFailure($this);
		if(!$record || !$record->ID) {
			return "Bad record ID #$pageId";
		}

		$record->doRevertToLive();
		$this->updateSiteTree($record);
		
		return "Restored ".$pageId." successfully";
	}

	/**
	 * Synonym for unpublish
	 * See SiteTree::doDeleteFromLive()
	 */
	public function deleteFromLive($data) {
		return $this->unpublish($data);
	}

	/**
	 * Restores a page back after deleting the published and draft page.
	 * Main functionality taken from CMSMain::restore($data, $form)
	 * @param  DataObject 	$record
	 * @return String
	 */
	public function restore($data) {
		// format data and get the page
		$pageId = $data->pageId;
		$record = $this->getRecord($pageId);
		$treeClass = $this->stat('tree_class');

		if(!$record || !$record->exists()) {
			throw new Exception('Page doesn\'t exists');
		}

		$restoredPage = $record->doRestoreToStage();
		if($restoredPage) {
			$this->updateSiteTree($record);
			return "Page successfully restored";
		} else {
			return "Error restoring page";
		}
	}
}
