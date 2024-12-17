import { useState } from 'react';
import { DatePicker } from "@nextui-org/react";
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import { parseDate } from "@internationalized/date";
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';

interface DateProps extends PConnFieldProps {
  // If any, enter additional props that only exist on Date here
}

export default function Date(props: DateProps) {
  const { 
    getPConnect,
    label,
    required,
    disabled,
    value,
    validatemessage,
    status,
    readOnly,
    helperText} = props;
  
  const [dateValue, setDateValue] = useState(value? parseDate(value): null);

  const pConn = getPConnect();
  const actions = pConn.getActionsApi();
  const propName = (pConn.getStateProps() as any).value;

  const handleChange = (date: any) => {
    setDateValue(date);

    if (date) {
      const dateString = date.toString();
      
      handleEvent(actions, 'changeNblur', propName, dateString);
    }
  };

  return (
    <DatePicker
    description={helperText}
    errorMessage={validatemessage}
    isDisabled={disabled}
    isInvalid={status === 'error'}
    isReadOnly={readOnly}
    isRequired={required}
    label={label}
    // @ts-ignore -- TS complains but this is what the NextUI docs say to do: https://nextui.org/docs/components/date-picker#controlled
    value={dateValue}
    variant={readOnly? 'bordered' : 'flat'}
    onChange={handleChange}
    />
  );
}
