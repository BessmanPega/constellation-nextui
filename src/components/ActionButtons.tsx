import { Button, Divider } from "@nextui-org/react";
import { PressEvent } from "@react-types/shared";

// ActionButtons does NOT have getPConnect. So, no need to extend from PConnProps
interface ActionButtonsProps {
  // If any, enter additional props that only exist on this component
  arMainButtons?: any[];
  arSecondaryButtons?: any[];
  onButtonPress: any;
}

export default function ActionButtons(props: ActionButtonsProps) {
  const { arMainButtons = [], arSecondaryButtons = [], onButtonPress } = props;
  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const localeCategory = 'Assignment';

  function handleButtonPress(sAction: string, sButtonType: string) {
    onButtonPress(sAction, sButtonType);
  }

  function renderButton(button: any, ordinal: 'primary' | 'secondary') {
    return  <Button
            key={button.name}
            color={ordinal}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onPress={(e: PressEvent) => { handleButtonPress(button.jsAction, ordinal); }}>
                {localizedVal(button.name, localeCategory)}
            </Button>

  }

  return (
    <>
        <Divider className="my-4"/>
        <div className="flex">
            <div className="flex grow space-x-4 items-start">
                {arSecondaryButtons.map((button: any) => {
                    // Filter out buttons we don't want to present to our customers.
                    if (button.name === 'Cancel' || button.name === 'Previous') {
                        return renderButton(button, 'secondary');
                    }

                    return null;
                })}
            </div>
            <div className="grid justify-items-end space-x-4">
                {arMainButtons.map((button: any) => { return renderButton(button, 'primary'); })}
            </div>
        </div>
    </>
  );
}
