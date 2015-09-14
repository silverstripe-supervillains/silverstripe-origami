<?php
class OrigamiDataObjectExtension extends DataExtension {

	private $schema_field_name = 'name';
	private $schema_field_value = 'value';
	private $schema_field_children = 'children';

	/**
	 * Set an objects fields based on the schema set in `getFieldSchema()`
	 * comparing changed objects.
	 * @param Array 	$fields
	 * @param Boolean 	$doPublish Defines if the page should be saved and published, or just saved.
	 */
	public function setCMSFieldsFromSchema($fields, $doPublish) {
		$schema = $this->flattenFieldSchema($fields);

		// only write if any changes have occured
		// else throw a message
		if(count($schema) || $doPublish) {
			$record = $this->owner;

			$record->update($schema);
			$record->write();

			if($doPublish) {
				$record->publish('Stage', 'Live');
				return "Page successfully published.";
			} else {
				return "Page successfully saved.";
			}
		} else {
			throw new Exception("No changes to process.");
		}
	}

	/**
	 * Compares two multidimensional arrays, returning any values that are different
	 * as a flat array of FieldName and Value.
	 * 
	 * @param  Array $fields
	 * @return Array
	 */
	protected function flattenFieldSchema($fields) {
		$return = array();

		foreach($fields as $key => $value) {
			if(array_key_exists($key, $fields)) {
				if(array_key_exists($this->schema_field_children, $value) && is_array($value[$this->schema_field_children])) {
					$flattenedSchema = $this->flattenFieldSchema($value[$this->schema_field_children]);
					$return = array_merge($return, $flattenedSchema);
				} else {
					$return[$value[$this->schema_field_name]] = $value[$this->schema_field_value];
				}
			}
		}

		return $return;
	}

	/**
	 * Formats the field data on an object defined in `getCMSFields` suitable
	 * for use on the frontend in the Origami application.
	 *
	 * @return Array
	 */
	public function getCMSFieldsSchema() {
		$response = array();

		// call `getCMSFields` on the object
		// iterate over the data fields to format as the correct output
		// handling nested fields (eg. TabSet, ToggleCompositeField)
		return $this->formatFields($this->owner->getCMSFields());
	}

	/**
	 * Formats the field actions on an object defined in `getCMSActions` suitable
	 * for use on the frontend in the Origami application.
	 * Inserts reset button used by Origami to reset the form
	 * 
	 * @return Array
	 */
	public function getCMSActionsSchema() {
		$actions = $this->owner->getCMSActions();

		$resetButton = FormAction::create('origami_reset', 'Reset');
		$actions->fieldByName('MajorActions')->push($resetButton);

		$saveButton = $actions->fieldByName('MajorActions')->fieldByName('action_save');
		$publishButton = $actions->fieldByName('MajorActions')->fieldByName('action_publish');

		// rename actions from past-tense (acted on) to infinitives (not acted on) to prime expectations of behaviour in Origami
		if ($saveButton && $saveButton->title == 'Saved') {
			$saveButton->title = 'Save';
		}
		if ($publishButton && $publishButton->title == 'Published') {
			$publishButton->title = 'Publish';
		}

		// call `getCMSActions` on the object
		// iterate over the data fields to format as the correct output
		return $this->formatFields($actions);
	}

	public function getBreadcrumbsSchema() {
		$schema = array();

		// add the parent ancestors
		$ancestors = array_reverse($this->owner->getAncestors()->toArray());
		foreach($ancestors as $ancestor) {
			$schema[] = array(
				"title" => $ancestor->Title,
				"id" => $ancestor->ID
			);
		}

		// add the current page
		$schema[] = array(
			"title" => $this->owner->Title,
			"id" => $this->owner->ID
		);
		
		return $schema;
	}

	/**
	 * Formats a fieldlist as an array of schemas used for rendering through the Origami API.
	 * 
	 * @param  FieldList $fields
	 * @return Array
	 */
	public function formatFields(FieldList $fields) {
		$response = array();

		foreach($fields as $field) {
			$response[$field->id] = $field->getSchema($this->owner);
		}

		return $response;
	}

}
