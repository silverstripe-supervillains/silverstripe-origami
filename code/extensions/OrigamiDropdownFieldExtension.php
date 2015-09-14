<?php
class OrigamiDropdownFieldExtension extends DataExtension {

	/**
	 * Add extra data to the drop down fields schema used by the Origami API to render a form field.
	 * Can be extended on child form fields for custom data.
	 *
	 * @return Array
	 */
	public function getExtraSchema() {
		$schema['options'] = $this->getOptions();
		return $schema;
	}


	public function getOptions() {
		$source = $this->owner->getSource();
		$options = array();
		if($source) {
			// SQLMap needs this to add an empty value to the options
			if(is_object($source) && $this->owner->emptyString) {
				$options[] = new ArrayData(array(
					'value' => '',
					'title' => $this->owner->emptyString,
				));
			}

			foreach($source as $value => $title) {
				$selected = false;
				if($value === '' && ($this->owner->value === '' || $this->owner->value === null)) {
					$selected = true;
				} else {
					// check against value, fallback to a type check comparison when !value
					if($value) {
						$selected = ($value == $this->owner->value);
					} else {
						$selected = ($value === $this->owner->value) || (((string) $value) === ((string) $this->owner->value));
					}

					$this->owner->isSelected = $selected;
				}

				$disabled = false;
				if(in_array($value, $this->owner->disabledItems) && $title != $this->owner->emptyString ){
					$disabled = 'disabled';
				}

				$options[] = array(
					'title' => $title,
					'value' => $value,
					'selected' => $selected,
					'disabled' => $disabled,
				);
			}
		}

		return $options;
	}

}
