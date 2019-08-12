/* eslint-disable react/prop-types */
import React, { useCallback } from "react";
import { isEmptyOrNil, isDefined } from "utility";

import { Form } from "react-bootstrap";
import NumericUpDown from "components/NumericUpDown";
import SyntaxHighlightedInput from "components/SyntaxHighlightedInput";
import AutoCompleteInput from "components/AutoCompleteInput";
import Switch from "components/Switch";

export default {
  string: StringInput,
  switch: SwitchInput,
  string_highlighted: StringHighlightedInput,
  numeric: NumericInput,
  string_auto_complete: StringAutoCompleteInput,
  string_array_auto_complete: StringArrayAutoCompleteInput
};

// ? ===================
// ? Input components
// ? ===================

// Basic string input
function StringInput({
  value,
  onChange,
  isInvalid,
  onTryCommit,
  name
  // // general configuration properties
  // append
}) {
  return (
    <Form.Control
      type="text"
      value={value}
      isInvalid={isInvalid}
      placeholder={name}
      onBlur={onTryCommit}
      onChange={useCallback(e => onChange(e.target.value), [onChange])}
      onKeyDown={useCallback(handleInputKeyPress(onTryCommit))}
    />
  );
}

// Basic boolean input
function SwitchInput({ value, onChange, onTryCommit }) {
  return (
    <Switch
      checked={value}
      onChange={useCallback(
        checked => {
          onChange(checked);
          onTryCommit();
        },
        [onChange, onTryCommit]
      )}
    />
  );
}

function StringHighlightedInput({
  value,
  onChange,
  isInvalid,
  onTryCommit,
  // // general configuration properties
  // append,
  // string_highlighted-specific configuration properties
  tokens = [],
  language
}) {
  return (
    <SyntaxHighlightedInput
      tokens={tokens}
      value={value}
      onChange={onChange}
      onBlur={onTryCommit}
      onKeyDown={useCallback(handleInputKeyPress(onTryCommit))}
      isInvalid={isInvalid}
      prismLanguage={language}
    />
  );
}

function NumericInput({
  value,
  onChange,
  isInvalid,
  onTryCommit,
  name,
  // // general configuration properties
  // append,
  // numeric-specific configuration properties
  integer = false,
  min,
  max,
  step = 1
}) {
  const transformDeps = [value, step, onChange, integer];
  const transformValue = (step, value, onChange) => () => {
    onChange(clamp(transform(value, step, !integer), min, max).toString());
    onTryCommit();
  };

  return (
    <NumericUpDown
      value={value.toString()}
      isInvalid={isInvalid}
      placeholder={name}
      onBlur={onTryCommit}
      onChange={useCallback(e => onChange(e.target.value), [onChange])}
      onKeyDown={useCallback(handleInputKeyPress(onTryCommit))}
      onUp={useCallback(transformValue(step, value, onChange), transformDeps)}
      onDown={useCallback(
        transformValue(-step, value, onChange),
        transformDeps
      )}
    />
  );
}

function StringAutoCompleteInput({
  value,
  onChange,
  isInvalid,
  onTryCommit,
  name,
  // // general configuration properties
  // append,
  // string_auto_complete-specific configuration properties
  "auto-complete-type": type
}) {
  return (
    <AutoCompleteInput
      renderSuggestion={s => <div>{s}</div>}
      getSuggestionValue={s => s}
      placeholder={name}
      value={value}
      onChange={onChange}
      isInvalid={isInvalid}
    />
  );
}

function StringArrayAutoCompleteInput() {
  return null;
}

// ? ===================
// ? Utility functions
// ? ===================

const clamp = (value, min, max) => {
  let newValue = value;
  if (isDefined(min)) newValue = Math.max(newValue, min);
  if (isDefined(max)) newValue = Math.min(newValue, max);
  return newValue;
};

const isLooselyNumeric = (value, float = false) =>
  !isNaN(parseNumber(value, float));

const canTransform = (value, float = false) =>
  isEmptyOrNil(value) || !isLooselyNumeric(value, float);

const parseNumber = (value, float = false) =>
  float ? parseFloat(value) : parseInt(value, 10);

const transform = (value, step, float = false) =>
  canTransform(value, float) ? 0 : parseNumber(value, float) + step;

const handleInputKeyPress = onEnter => e => {
  const code = e.keyCode || e.which;
  // Enter keycode
  if (code === 13) {
    onEnter();
    e.target.blur();
  }
};