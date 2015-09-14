<?php
class OrigamiPage extends Page {

	public function getCMSFields() {
		$fields = parent::getCMSFields();
		
		$fields->addFieldToTab("Root.Main", new TextField("textfield", "Text field"), 'Metadata');
		$fields->addFieldToTab("Root.Main", new TextAreaField("textarea", "Textarea"), 'Metadata');
		$fields->addFieldToTab('Root.Main', new CheckboxField('ShowInSearch', 'Show in search?'), 'Metadata');
		$fields->addFieldToTab('Root.Main', OptionsetField::create('Icon', 'Icon', array(1 => 'option 1',
																						 2 => 'option 2')), 'Metadata');
		$fields->addFieldToTab('Root.Main', new HTMLEditorField('Description', 'Description'), 'Metadata');
		$fields->addFieldToTab('Root.Main', new HiddenField('Referrer', 'Referrer', 'listview'), 'Metadata');
		$fields->addFieldToTab('Root.Main', new DateField('datefoeld'), 'Metadata');
		$fields->addFieldToTab('Root.Main', EmailField::create('Email', 'Email'), 'Metadata');
		$fields->addFieldToTab('Root.Main', PhoneNumberField::create('Phone', 'Phone'), 'Metadata');
		
		return $fields;
	}
}



/**
 * Handles display of initial page for origami
 */
class OrigamiPageController extends ContentController {
	// needed for the routing hack in index()
	private static $url_handlers = array(
		'$param' => 'index'
	);

	/**
	 * Required assets
	 */
	public function init() {
		parent::init();

		// css requirements
		Requirements::css(ORIGAMI_DIR . 'node_modules/normalize.css/normalize.css');
		Requirements::css(ORIGAMI_DIR . 'node_modules/font-awesome/css/font-awesome.css');
		Requirements::css(ORIGAMI_DIR . 'vendor/bootstrap/dist/css/bootstrap.css');
		Requirements::css(ORIGAMI_DIR . 'css/styles.css');

		// javascript requirements
		Requirements::javascript(ORIGAMI_DIR . 'javascript/vendor.js');
		Requirements::javascript(ORIGAMI_DIR . 'vendor/tinymce/js/tinymce/tinymce.min.js');
		Requirements::javascript(ORIGAMI_DIR . 'javascript/app.js');
	}

	/**
	 * Gives security error if user is not logged in and tries to access an origami url
	 */
	public function index($request) {
		$member = Member::currentUser();
		$hasAccess = Permission::checkMember($member, 'CMS_ACCESS');

		$params = $this->request->allParams();
		$firstParam = reset($params);

		// allow all subsequent routes through
		while(!$request->allParsed()) $request->shift();

		// if we're not logged in, and it's the login form route
		// otherwise if we're not logged in
		if (!$hasAccess) {
			return Security::permissionFailure($this);
		}

		return new SS_HTTPResponse($this->renderWith('OrigamiPage'));
	}

	/**
	 * To pass to the template for JS app to access the path
	 * Needs to go up two levels to fix odd <base> tag setup
	 */
	public function OrigamiDir() {
		return '../../' . ORIGAMI_DIR;
	}

}
