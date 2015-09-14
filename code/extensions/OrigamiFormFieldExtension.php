<?php
class OrigamiFormFieldExtension extends DataExtension {

	/**
	 * Return the form field schema used by the Origami API to render a form field.
	 * Can be extended on child form fields for custom data.
	 *
	 * @return Array
	 */
	public function getSchema($record) {
		$this->owner->setForm(null);
		$name = $this->owner->getName();
		$className = get_class($this->owner);

		$schema = array(
			'id' 			=> $this->owner->ID(),
			'name' 			=> $name,
			'title' 		=> $this->owner->Title(),
			'classname' 	=> $className,
			'directiveName' => $this->getDirectiveName($className),
			'value' 		=> $record->$name,
			'children'		=> null
		);

		if(isset($this->owner->children)) {
			$schema['children'] = $this->getChildFieldsSchema($this->owner->children, $record);
		}

		// TODO:
		// Think of a better way to do this
		$schema = array_merge($schema, $this->owner->getExtraSchema());

		return $schema;
	}

	/**
	 * Default helper to return an array of keys to add to the original schema
	 * Override on child extension classes
	 *
	 * @return array
	 */
	public function getExtraSchema() {
		return array();
	}

	/**
	 * If the formfield has children then add the child schema to the response.
	 *
	 * @param  FieldList $fields
	 * @return Array
	 */
	public function getChildFieldsSchema(FieldList $fields, $record) {
		$response = array();

		foreach($fields as $field) {
			$schema = $field->getSchema($record);
			$response[$schema['id']] = $schema;
		}

		return $response;
	}

	/**
	 * Get the forms class name formatted to be used as a directive name in the Origami API.
	 *
	 * @param  String $className
	 * @return String
	 */
	public function getDirectiveName($className) {
		$cb = preg_replace_callback(
			'/([A-Z]+)/',
			function ($matches) {
				$character = reset($matches);
				return '-' . strtolower($character);
			},
			$className
		);

		return ltrim($cb, '-');
	}

}
