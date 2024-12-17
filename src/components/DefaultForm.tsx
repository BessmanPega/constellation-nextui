import { createElement, PropsWithChildren } from 'react';
import { getInstructions } from '@pega/react-sdk-components/lib/components/helpers/template-utils';
import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';
import connectToState from '@pega/react-sdk-components/lib/components/helpers/state-utils';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { v4 as uuidv4 } from 'uuid';

const mapStateToProps: any = (_: any, ownProps: any) => {
  const { getPConnect } = ownProps;

  return {
    visibility: getPConnect().getComputedVisibility(),
    getPConnect
  };
};
  
const getKeyForMappedField = (field: any): any => {
  if (Array.isArray(field)) {
    return field
      .map(item => {
        return getKeyForMappedField(item);
      })
      .join('__');
  }

  const pConnect = field?.getPConnect?.();

  if (pConnect?.meta) {
    return JSON.stringify(pConnect.meta);
  }

  return uuidv4();
};

interface DefaultFormProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  NumCols: string;
  instructions: string;
}

const Child = connectToState(mapStateToProps)((props: any) => {
  const { key, visibility, ...rest } = props;

  return createElement(createPConnectComponent(), { ...rest, key, visibility });
});

export default function DefaultForm(props: PropsWithChildren<DefaultFormProps>) {
  const { getPConnect, NumCols = '1' } = props;
  const instructions = getInstructions(getPConnect());

  let childrenClassName: string;

  const numCols = NumCols || '1';

  switch (numCols) {
    case '1':
      childrenClassName = 'grid grid-cols-1 gap-4';
      break;
    case '2':
      childrenClassName = 'grid grid-cols-2 gap-4';
      break;
    case '3':
      childrenClassName = 'grid grid-cols-3 gap-4';
      break;
    default:
      childrenClassName = 'grid grid-cols-1 gap-4';
      break;
  }

  // repoint the children because they are in a region and we need to not render the region
  // to take the children and create components for them, put in an array and pass as the
  // defaultForm kids
  const arChildren = getPConnect().getChildren()[0].getPConnect().getChildren();
  const dfChildren = arChildren?.map(kid => <Child key={getKeyForMappedField(kid)} {...kid} />);

  return (
    <>
      {instructions?
        <div dangerouslySetInnerHTML={{ __html: instructions }} key='instructions' className="my-2"/>
      :null}
      <div className={childrenClassName}>{dfChildren}</div>
    </>
  );
}
