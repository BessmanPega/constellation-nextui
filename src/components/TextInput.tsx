/* eslint-disable no-console */
import { useState, useEffect } from 'react';
import { Input } from '@nextui-org/input'
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';

interface TextInputProps extends PConnFieldProps {
  // If any, enter additional props that only exist on TextInput here
  fieldMetadata?: any;
}

export default function TextInput(props: TextInputProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const FieldValueList = getComponentFromMap('FieldValueList');

  const {
    getPConnect,
    label,
    required,
    disabled,
    value = '',
    validatemessage,
    status,
    /* onChange, onBlur */
    readOnly,
    testId,
    fieldMetadata,
    helperText,
    displayMode,
    hideLabel,
    placeholder
  } = props;

  const pConn = getPConnect();
  const actions = pConn.getActionsApi();
  const propName = (pConn.getStateProps() as any).value;

  const helperTextToDisplay = validatemessage || helperText;

  const [inputValue, setInputValue] = useState('');
  const maxLength = fieldMetadata?.maxLength;

  let readOnlyProp = {}; // Note: empty if NOT ReadOnly

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  if (displayMode === 'DISPLAY_ONLY') {
    return <FieldValueList name={hideLabel ? '' : label} value={value} />;
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    return <FieldValueList name={hideLabel ? '' : label} value={value} variant='stacked' />;
  }

  if (readOnly) {
    readOnlyProp = { readOnly: true };
  }

  let testProp = {};

  testProp = {
    'data-test-id': testId
  };

  function handleChange(event: any) {  
    // update internal value
    setInputValue(event?.target?.value);
  }

  function handleBlur() {
    // Register new value with the SDK.
    handleEvent(actions, 'changeNblur', propName, inputValue);
  }

  function inputProps() {
    let props: any;

    if (required) {
        props.isRequired = {};
    }

    return props;
  }

  return (
    <Input
        description={helperText}
        errorMessage={validatemessage}
        isDisabled={disabled}
        isInvalid={status === 'error'}
        isReadOnly={readOnly}
        isRequired={required}
        label={label}
        placeholder={placeholder}
        value={inputValue}
        onBlur={!readOnly? handleBlur : undefined }
        onChange={handleChange}
    />
  );
}
