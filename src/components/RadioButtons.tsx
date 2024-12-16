import {RadioGroup, Radio} from "@nextui-org/react";
import Utils from '@pega/react-sdk-components/lib/components/helpers/utils';
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';

// Can't use RadioButtonProps until getLocaleRuleNameFromKeys is NOT private
interface RadioButtonsProps extends PConnFieldProps {
  // If any, enter additional props that only exist on RadioButtons here
  inline: boolean;
  fieldMetadata?: any;
}

// This is the type returned by Utils.getOptionList().
interface Option {
    key: string;
    value: string;
}

export default function RadioButtons(props: RadioButtonsProps) {
  const {
    getPConnect,
    disabled,
    label,
    value = '',
    readOnly,
    validatemessage,
    helperText,
    status,
    required,
    fieldMetadata
  } = props;

  const thePConn = getPConnect();
  const theConfigProps = thePConn.getConfigProps();
  const actionsApi = thePConn.getActionsApi();
  const propName = (thePConn.getStateProps() as any).value;
  const className = thePConn.getCaseInfo().getClassName();

  let configProperty = (thePConn.getRawMetadata() as any)?.config?.value || '';

  configProperty = configProperty.startsWith('@P') ? configProperty.substring(3) : configProperty;
  configProperty = configProperty.startsWith('.') ? configProperty.substring(1) : configProperty;

  const metaData = Array.isArray(fieldMetadata) ? fieldMetadata.filter(field => field?.classID === className)[0] : fieldMetadata;
  let displayName = metaData?.datasource?.propertyForDisplayText;

  displayName = displayName?.slice(displayName.lastIndexOf('.') + 1);
  const localeContext = metaData?.datasource?.tableType === 'DataPage' ? 'datapage' : 'associated';
  const localeClass = localeContext === 'datapage' ? '@baseclass' : className;
  const localeName = localeContext === 'datapage' ? metaData?.datasource?.name : configProperty;
  const localePath = localeContext === 'datapage' ? displayName : localeName;

  const theOptions = Utils.getOptionList(theConfigProps, thePConn.getDataObject('')) as Array<Option>;

  const handleChange = (newValue: string) => {
    handleEvent(actionsApi, 'changeNblur', propName, newValue);
    thePConn.getValidationApi().validate(newValue, '');
  };

  return (
    <RadioGroup
    description={helperText}
    errorMessage={validatemessage}
    isDisabled={disabled}
    isInvalid={status === 'error'}
    isReadOnly={readOnly}
    isRequired={required}
    label={label}
    value={value}
    onValueChange={handleChange}
    >
        {theOptions.map((theOption: Option) => {
            return (
                <Radio key={theOption.key} value={theOption.key}>
                    {thePConn.getLocalizedValue(
                        theOption.value,
                        localePath,
                        thePConn.getLocaleRuleNameFromKeys(localeClass, localeContext, localeName)
                    )}
                </Radio>
            )
        })}
    </RadioGroup>
  );
}
