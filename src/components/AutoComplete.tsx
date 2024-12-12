import { useEffect, useState } from 'react';
import {Autocomplete, AutocompleteItem} from "@nextui-org/react";
import isDeepEqual from 'fast-deep-equal/react';
import Utils from '@pega/react-sdk-components/lib/components/helpers/utils';
import { getDataPage } from '@pega/react-sdk-components/lib/components/helpers/data_page';
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';

interface IOption {
  key: string;
  value: string;
}

const preProcessColumns = (columnList: any) => {
  return columnList.map((col: any) => {
    const tempColObj = { ...col };

    tempColObj.value = col.value && col.value.startsWith('.') ? col.value.substring(1) : col.value;

    return tempColObj;
  });
};

const getDisplayFieldsMetaData = (columnList: any) => {
  const displayColumns = columnList.filter((col: any) => col.display === 'true');
  const metaDataObj: any = { key: '', primary: '', secondary: [] };
  const keyCol = columnList.filter((col: any) => col.key === 'true');

  metaDataObj.key = keyCol.length > 0 ? keyCol[0].value : 'auto';
  for (let index = 0; index < displayColumns.length; index += 1) {
    if (displayColumns[index].primary === 'true') {
      metaDataObj.primary = displayColumns[index].value;
    } else {
      metaDataObj.secondary.push(displayColumns[index].value);
    }
  }

  return metaDataObj;
};

interface AutoCompleteProps extends PConnFieldProps {
  // If any, enter additional props that only exist on AutoComplete here'
  displayMode?: string;
  deferDatasource?: boolean;
  datasourceMetadata?: any;
  status?: string;
  onRecordChange?: any;
  additionalProps?: object;
  listType: string;
  parameters?: any;
  datasource: any;
  columns: any[];
}

export default function AutoComplete(props: AutoCompleteProps) {
  // Get emitted components from map (so we can get any override that may exist)
  const TextInput = getComponentFromMap('TextInput');
  const FieldValueList = getComponentFromMap('FieldValueList');

  const {
    getPConnect,
    label,
    required,
    placeholder,
    value = '',
    validatemessage,
    readOnly,
    disabled,
    displayMode,
    deferDatasource,
    datasourceMetadata,
    status,
    helperText,
    hideLabel,
    onRecordChange
  } = props;

  const context = getPConnect().getContextName();
  let { listType, parameters, datasource = [], columns = [] } = props;
  const [options, setOptions] = useState<IOption[]>([]);
  const [theDatasource, setDatasource] = useState(null);
  let selectedValue: any = '';

  const thePConn = getPConnect();
  const actionsApi = thePConn.getActionsApi();
  const propName = (thePConn.getStateProps() as any).value;

  if (!isDeepEqual(datasource, theDatasource)) {
    // inbound datasource is different, so update theDatasource (to trigger useEffect)
    setDatasource(datasource);
  }

  const flattenParameters = (params: any = {}) => {
    const flatParams: any = {};

    Object.keys(params).forEach(key => {
      const { name, value: theVal } = params[key];

      flatParams[name] = theVal;
    });

    return flatParams;
  };

  // convert associated to datapage listtype and transform props
  // Process deferDatasource when datapage name is present. WHhen tableType is promptList / localList
  if (deferDatasource && datasourceMetadata?.datasource?.name) {
    listType = 'datapage';
    datasource = datasourceMetadata.datasource.name;
    const { parameters: dataSourceParameters, propertyForDisplayText, propertyForValue } = datasourceMetadata.datasource;

    parameters = flattenParameters(dataSourceParameters);
    const displayProp = propertyForDisplayText.startsWith('@P') ? propertyForDisplayText.substring(3) : propertyForDisplayText;
    const valueProp = propertyForValue.startsWith('@P') ? propertyForValue.substring(3) : propertyForValue;

    columns = [
      {
        key: 'true',
        setProperty: 'Associated property',
        value: valueProp
      },
      {
        display: 'true',
        primary: 'true',
        useForSearch: true,
        value: displayProp
      }
    ];
  }
  columns = preProcessColumns(columns);

  useEffect(() => {
    if (listType === 'associated') {
      setOptions(Utils.getOptionList(props, getPConnect().getDataObject('')));
    }
  }, [theDatasource]);

  useEffect(() => {
    if (!displayMode && listType !== 'associated') {
      getDataPage(datasource, parameters, context).then((results: any) => {
        const optionsData: any[] = [];
        const displayColumn = getDisplayFieldsMetaData(columns);

        results?.forEach((element: any) => {
          const val = element[displayColumn.primary]?.toString();
          const obj = {
            key: element[displayColumn.key] || element.pyGUID,
            value: val
          };

          optionsData.push(obj);
        });
        setOptions(optionsData);
      });
    }
  }, []);

  if (displayMode === 'DISPLAY_ONLY') {
    return <FieldValueList name={hideLabel ? '' : label} value={value} />;
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    return <FieldValueList name={hideLabel ? '' : label} value={value} variant='stacked' />;
  }

  if (value) {
    const index = options?.findIndex(element => element.key === value);

    if (index > -1) {
      selectedValue = options[index].value;
    } else {
      selectedValue = value;
    }
  }

  const handleChange = (val: any) => {
    handleEvent(actionsApi, 'changeNblur', propName, val);
    if (onRecordChange) {
      onRecordChange(val);
    }
  };

  if (readOnly) {
    const theValAsString = options?.find(opt => opt.key === value)?.value;
    
    return <TextInput {...props} value={theValAsString} />;
  }

  return (
    <Autocomplete
      defaultSelectedKey={selectedValue}
      description={helperText}
      errorMessage={validatemessage}
      isDisabled={disabled}
      isInvalid={status === 'error'}
      isReadOnly={readOnly}
      isRequired={required}
      label={label}
      placeholder={placeholder}
      onInputChange={handleChange}
    >
      {options.map((option) => (
        <AutocompleteItem key={option.key}>{option.value}</AutocompleteItem>
      ))}
    </Autocomplete>
  );
}
