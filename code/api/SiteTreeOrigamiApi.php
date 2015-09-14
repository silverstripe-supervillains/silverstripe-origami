<?php
/**
 * Sitetree API to get tree structure
 */
class SiteTreeOrigamiApi extends OrigamiApi {

	/**
	 * Get the cache key for the current logged in users sitetree.
	 * Cache key is set by groups because that defines the permissions of accessible pages 
	 * on the site tree.
	 * 
	 * @return String 	The cache key as an md5 string
	 */
	public static function get_cache_key() {
		$user = Member::currentUser();
		$groups = $user->Groups();
		$groupsKey = '';

		// groups come sorted by ID, so order will remain the same
		foreach($groups as $group) {
			$groupsKey .= $group->ID;
		}

		return md5(sprintf('SiteTree_%s', $groupsKey));
	}

	/**
	 * Reset and regenerate the site tree cache.
	 */
	public static function reset_cache() {
		$cache = SS_Cache::factory('SiteTree_Groups');
		//$cache->remove(SiteTreeOrigamiApi::get_cache_key());
		$cache->clean(Zend_Cache::CLEANING_MODE_MATCHING_TAG);
	}

	/**
	 * Emit the sitetree structure out to the ZMQInterface so the OrigamiAPI updates
	 * all the correct things.
	 * 
	 * @param  Int 			$socketId 		Optional socketId if the emit only needs to be sent to a specific session.
	 * @param  SiteTree  	$partialChild  	Optional partial child to get a site tree section from root.
	 */
	public static function emit_structure($socketId = null, SiteTree $partialChild = null) {
		$siteTree = new SiteTreeOrigamiApi();
		$siteTree = $siteTree->getStructure(0, $partialChild);
		ZMQInterface::emit('sitetree/structure', $siteTree, $socketId);
	}

	/**
	 * Sitetree getter, caches the whole sitetree per logged in user groups.
	 * If a $partialChild is defined then the cache is bypassed and a partial sitetree is returned.
	 *
	 * @param  Int 			$id 				Optional id used to define the parent to kick off from.
	 * @param  SiteTree  	$partialChild   	Optional partial child to get a site tree section from root.
	 */
	public function getStructure($id = 0, $partialChild = null) {
		if(!Member::currentUserID()) {
			throw new Exception('SiteTreeOrigamiApi::getStructure Not logged in');
		}

		if($partialChild) {
			$stack = array_reverse($partialChild->parentStack());
			$result = $this->_structure($id, $stack);
		} else {
			// Check the cache.
			SS_Cache::set_cache_lifetime('SiteTree_Groups', 60*60); //one hour
			$cache = SS_Cache::factory('SiteTree_Groups', 'Output', array('automatic_serialization' => true));

			// If there isn't a cached response call the API.
			if(!($result = $cache->load(SiteTreeOrigamiApi::get_cache_key()))) {
				$result = $this->_structure($id);
				$cache->save($result, SiteTreeOrigamiApi::get_cache_key());
			}
		}

		return $result;
	}

	/**
	 * Sitetree getter. Not able to reutilize {@see LeftAndMain::getSiteTreeFor()}
	 * @link https://docs.silverstripe.org/en/3.1/developer_guides/customising_the_admin_interface/how_tos/customise_cms_tree/
	 * 
	 * @param  Int 			$id 			Optional id used to define the parent to kick off from.
	 * @param  SiteTree  	$partialChild   Optional partial child to get a site tree section from root.
	 * 
	 * TODO: moving the page should return a sitetree up to the top of the partialStack including all children.
	 */
	private function _structure($id = 0, $partialStack = null) {
		$includeChildren = true;
		$filter = array(
			'ParentID' => $id
		);

		// setup the partial stack filter, the partial stack is an array of pages beginning
		// at the root and ending at the partialChild page (@see Hierarchy::parentStack()).
		// Once it hits the partialChild then don't include any more children.
		if($partialStack) {
			if($stackPage = array_shift($partialStack)) {
				if(count($partialStack)) {
					$filter['ID'] = $stackPage->ID;
				} else {
					$includeChildren = false;
				}
			}
		}

		$sitetreeDraft = SiteTree::get()->filter($filter)->sort('Sort', 'ASC'); //draft
		$sitetreeLive = Versioned::get_by_stage('SiteTree', 'Live')->filter($filter)->sort('Sort', 'ASC');

		$merged = new ArrayList();
		$merged->merge($sitetreeDraft);
		$merged->merge($sitetreeLive);
		$sitetree = $merged;

		$sitetree->removeDuplicates();

		$structure = array();
		foreach($sitetree as $branch) {
			// check permissions
			if(!$branch->canView()) {
				continue;
			}

			// get the children if required
			$children = array();
			if($includeChildren) {
				$children = $this->_structure($branch->ID, $partialStack);
			}

			$structure[$branch->ID] = array(
				'id' => $branch->ID,
				'pagetype' => $branch->ClassName,
				'title' => $branch->MenuTitle,
				'flags' => $branch->getStatusFlags(),
				'sort' => $branch->Sort,
				'children' => $children
			);
		}
		return $structure;
	}
}
