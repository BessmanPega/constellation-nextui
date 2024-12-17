import { PropsWithChildren, useEffect, useState } from 'react';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';

interface AssignmentCardProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  actionButtons: any;
  onButtonPress: any;
}

export default function AssignmentCard(props: PropsWithChildren<AssignmentCardProps>) {
  // Get emitted components from map (so we can get any override that may exist)
  const ActionButtons = getComponentFromMap('ActionButtons');

  const { children, actionButtons, onButtonPress } = props;

  const [arMainButtons, setArMainButtons] = useState([]);
  const [arSecondaryButtons, setArSecondaryButtons] = useState([]);

  useEffect(() => {
    if (actionButtons) {
      setArMainButtons(actionButtons.main);
      setArSecondaryButtons(actionButtons.secondary);
    }
  }, [actionButtons]);

  function buttonPress(sAction: any, sType: any) {
    onButtonPress(sAction, sType);
  }

  return (
    <>
      <div className="px-4 py-2">
        {children}
      </div>
      {arMainButtons && arSecondaryButtons && (
        <ActionButtons arMainButtons={arMainButtons} arSecondaryButtons={arSecondaryButtons} onButtonPress={buttonPress} />
      )}
    </>
  );
}
