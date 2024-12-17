import { PropsWithChildren } from 'react';
import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { Breadcrumbs, BreadcrumbItem, Chip } from "@nextui-org/react";

interface MultiStepProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  itemKey: string;
  actionButtons: any[];
  onButtonPress: any;
  bIsVertical: boolean;
  arNavigationSteps: any;
}

interface NavigationStep {
    visited_status: any;
    vs: any;
}

export default function MultiStep(props: PropsWithChildren<MultiStepProps>) {
  // Get emitted components from map (so we can get any override that may exist)
  const AssignmentCard = getComponentFromMap('AssignmentCard');

  const { getPConnect, children, actionButtons, arNavigationSteps, onButtonPress } = props;

  let currentStep = arNavigationSteps.find(({ visited_status: vs }: NavigationStep) => vs === 'current');

  if (!currentStep) {
    const lastActiveStepIndex = arNavigationSteps.findLastIndex(({ visited_status: vs }: NavigationStep) => vs === 'success');

    currentStep = arNavigationSteps[lastActiveStepIndex >= 0 ? lastActiveStepIndex : 0];
  }

  function buttonPress(sAction: string, sButtonType: string) {
    onButtonPress(sAction, sButtonType);
  }

  return (
    <div className="text-left">
        <Breadcrumbs className="my-4">
            {arNavigationSteps.map((mainStep: any, index: any) => {
                return (
                <BreadcrumbItem key={mainStep.actionID} isCurrent={mainStep.ID === currentStep?.ID}>
                    <Chip >{index + 1}</Chip>
                    {mainStep.name}
                </BreadcrumbItem>
                );
            })}
        </Breadcrumbs>
        {arNavigationSteps.map((mainStep: any) => {
            if (mainStep.ID === currentStep.ID) {
                return (
                    <AssignmentCard key={mainStep.actionID} actionButtons={actionButtons} getPConnect={getPConnect} onButtonPress={buttonPress}>
                        {children}
                    </AssignmentCard>
                );
            }
        })}
    </div>
  );
}
