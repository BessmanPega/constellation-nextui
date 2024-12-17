import { useCallback, useState } from 'react';
import { Input } from "@nextui-org/react";
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';

interface PhoneProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Phone here
}

export default function Phone(props: PhoneProps) {
  const {
    getPConnect,
    label,
    required,
    disabled,
    value = '',
    validatemessage,
    status,
    onChange,
    readOnly,
    helperText,
    placeholder
  } = props;

  const pConn = getPConnect();
  const actions = pConn.getActionsApi();
  const propName = (pConn.getStateProps() as any).value;

  const [inputValue, setInputValue] = useState(value);

  let displayValue = ""; // Internally we store a plain number. We display this formatted value to the user.

  if (inputValue.length > 0) {
    displayValue = "(" + inputValue.substring(0, 3);   // (123)

    if (inputValue.length > 3) {
        displayValue = displayValue + ") " + inputValue.substring(3, 6); // (123) 456

        if (inputValue.length > 6) {
            displayValue = displayValue + "-" + inputValue.substring(6, inputValue.length); // (123) 456-7890
        }
    }
  }

  const stripNonNumericChars = (input: string): string => {
    const result = input.replace(/\D/g, '');

    return result;
  }

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
    const newValue = stripNonNumericChars(event.currentTarget.value);

    setInputValue(newValue);
    if (onChange) {
        onChange(event);
    }
  }, [setInputValue, onChange]);

  const handleBlur = useCallback<React.FocusEventHandler>((event)  => {
    const target = event.currentTarget as HTMLInputElement;
    const newValue = stripNonNumericChars(target.value);

    handleEvent(actions, 'changeNblur', propName, newValue);
  }, [handleEvent, actions, propName]);

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
    type="tel"
    value={displayValue}
    variant={readOnly? 'bordered' : 'flat'}
    onBlur={handleBlur}
    onChange={handleChange}
    />
  );
}
