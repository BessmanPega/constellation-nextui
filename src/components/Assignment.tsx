import { PropsWithChildren, useEffect, useState } from 'react';
import { useDisclosure, Drawer, DrawerContent, DrawerHeader } from '@nextui-org/react';
import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { useFocusFirstField, useScrolltoTop } from '@pega/react-sdk-components/lib/hooks';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';

interface AssignmentProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  itemKey: string;
  isInModal: boolean;
  banners: any[];
  // eslint-disable-next-line react/no-unused-prop-types
  actionButtons: any[];
}

export default function Assignment(props: PropsWithChildren<AssignmentProps>) {
  // Get emitted components from map (so we can get any override that may exist)
  const AssignmentCard = getComponentFromMap('AssignmentCard');
  const MultiStep = getComponentFromMap('MultiStep');
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const { getPConnect, children, itemKey = '', isInModal = false, banners = [] } = props;
  const thePConn = getPConnect();

  const [bHasNavigation, setHasNavigation] = useState(false);
  const [actionButtons, setActionButtons] = useState([]);
  const [bIsVertical, setIsVertical] = useState(false);
  const [arCurrentStepIndicies, setArCurrentStepIndicies] = useState<any[]>([]);
  const [arNavigationSteps, setArNavigationSteps] = useState<any[]>([]);

  const actionsAPI = thePConn.getActionsApi();
  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const localeCategory = 'Assignment';
  const localeReference = `${getPConnect().getCaseInfo().getClassName()}!CASE!${getPConnect().getCaseInfo().getName()}`.toUpperCase();

  // store off bound functions to above pointers
  const finishAssignment = actionsAPI.finishAssignment.bind(actionsAPI);
  const navigateToStep = actionsAPI.navigateToStep.bind(actionsAPI);
  const cancelAssignment = actionsAPI.cancelAssignment.bind(actionsAPI);
  const saveAssignment = actionsAPI.saveAssignment?.bind(actionsAPI);
  const cancelCreateStageAssignment = actionsAPI.cancelCreateStageAssignment.bind(actionsAPI);
  const approveCase = actionsAPI.approveCase?.bind(actionsAPI);
  const rejectCase = actionsAPI.rejectCase?.bind(actionsAPI);
  // const showPage = actionsAPI.showPage.bind(actionsAPI);

  //const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  function findCurrentIndicies(arStepperSteps: any[], arIndicies: number[], depth: number): number[] {
    let count = 0;

    arStepperSteps.forEach(step => {
      if (step.visited_status === 'current') {
        arIndicies[depth] = count;

        // add in
        step.step_status = '';
      } else if (step.visited_status === 'success') {
        count += 1;
        step.step_status = 'completed';
      } else {
        count += 1;
        step.step_status = '';
      }

      if (step.steps) {
        arIndicies = findCurrentIndicies(step.steps, arIndicies, depth + 1);
      }
    });

    return arIndicies;
  }

  function getStepsInfo(steps: any, formedSteps: any = []) {
    steps.forEach((step: any) => {
      if (step.name) {
        step.name = PCore.getLocaleUtils().getLocaleValue(step.name, undefined, localeReference);
      }
      if (step.steps) {
        formedSteps = getStepsInfo(step.steps, formedSteps);
      } else {
        formedSteps.push(step);
      }
    });

    return formedSteps;
  }

  const scrollId = window.location.href.includes('embedded') ? '#pega-part-of-page' : '#portal';

  useScrolltoTop(scrollId, children);
  useFocusFirstField('Assignment', children);

  useEffect(() => {
    if (children) {
      const firstChild = Array.isArray(children) ? children[0] : children;
      const oWorkItem = firstChild.props.getPConnect();
      const oWorkData = oWorkItem.getDataObject();
      const oData: any = thePConn.getDataObject(''); // 1st arg empty string until typedefs allow it to be optional

      if (oWorkData?.caseInfo && oWorkData.caseInfo.assignments !== null) {
        const oCaseInfo = oData?.caseInfo;

        if (oCaseInfo && oCaseInfo.actionButtons) {
          setActionButtons(oCaseInfo.actionButtons);
        }

        if (oCaseInfo?.navigation /* was oCaseInfo.navigation != null */) {
          setHasNavigation(true);

          if (
            (oCaseInfo.navigation.template && oCaseInfo.navigation.template.toLowerCase() === 'standard') ||
            oCaseInfo?.navigation?.steps?.length === 1
          ) {
            setHasNavigation(false);
          } else if (oCaseInfo.navigation.template && oCaseInfo.navigation.template.toLowerCase() === 'vertical') {
            setIsVertical(true);
          } else {
            setIsVertical(false);
          }

          if (oCaseInfo?.navigation?.steps) {
            const steps = JSON.parse(JSON.stringify(oCaseInfo?.navigation?.steps));
            const formedSteps = getStepsInfo(steps);

            setArNavigationSteps(formedSteps);
          }

          setArCurrentStepIndicies(findCurrentIndicies(arNavigationSteps, arCurrentStepIndicies, 0));
        }
      }
    }
  }, [children]);

  function showToast(message: string) {
    const theMessage = `Assignment: ${message}`;

    // eslint-disable-next-line no-console
    console.error(theMessage);
    setSnackbarMessage(message);
    onOpen();
  }

  function onSaveActionSuccess(data: any) {
    actionsAPI.cancelAssignment(itemKey, false).then(() => {
      PCore.getPubSubUtils().publish(PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CREATE_STAGE_SAVED, data);
    });
  }

  function buttonPress(sAction: string, sButtonType: string) {
    if (sButtonType === 'secondary') {
      switch (sAction) {
        case 'navigateToStep': {
          const navigatePromise = navigateToStep('previous', itemKey);

          navigatePromise
            .then(() => {})
            .catch(() => {
              showToast(`${localizedVal('Navigation failed!', localeCategory)}`);
            });

          break;
        }

        case 'saveAssignment': {
          const caseID = thePConn.getCaseInfo().getKey();
          const assignmentID = thePConn.getCaseInfo().getAssignmentID();
          const savePromise = saveAssignment(itemKey);

          savePromise
            .then(() => {
              // @ts-ignore - Property 'c11nEnv' is private and only accessible within class 'CaseInfo'.
              const caseType = thePConn.getCaseInfo().c11nEnv.getValue(PCore.getConstants().CASE_INFO.CASE_TYPE_ID);

              onSaveActionSuccess({ caseType, caseID, assignmentID });
            })
            .catch(() => {
              showToast(`${localizedVal('Save failed', localeCategory)}`);
            });

          break;
        }

        case 'cancelAssignment': {
          // check if create stage (modal)
          const { PUB_SUB_EVENTS } = PCore.getConstants();
          const { publish } = PCore.getPubSubUtils();
          // @ts-ignore - Property 'isAssignmentInCreateStage' is private and only accessible within class 'CaseInfo'
          const isAssignmentInCreateStage = thePConn.getCaseInfo().isAssignmentInCreateStage();
          const isLocalAction =
            // @ts-ignore - Property 'isLocalAction' is private and only accessible within class 'CaseInfo'.
            thePConn.getCaseInfo().isLocalAction() ||
            (PCore.getConstants().CASE_INFO.IS_LOCAL_ACTION && getPConnect().getValue(PCore.getConstants().CASE_INFO.IS_LOCAL_ACTION));

          if (isAssignmentInCreateStage && isInModal && !isLocalAction) {
            const cancelPromise = cancelCreateStageAssignment(itemKey);

            cancelPromise
              .then(data => {
                publish(PUB_SUB_EVENTS.EVENT_CANCEL, data);
              })
              .catch(() => {
                showToast(`${localizedVal('Cancel failed!', localeCategory)}`);
              });
          } else {
            const cancelPromise = cancelAssignment(itemKey, false);

            cancelPromise
              .then(data => {
                publish(PUB_SUB_EVENTS.EVENT_CANCEL, data);
              })
              .catch(() => {
                showToast(`${localizedVal('Cancel failed!', localeCategory)}`);
              });
          }
          break;
        }

        case 'rejectCase': {
          const rejectPromise = rejectCase(itemKey);

          rejectPromise
            .then(() => {})
            .catch(() => {
              showToast(`${localizedVal('Rejection failed!', localeCategory)}`);
            });

          break;
        }

        default:
          break;
      }
    } else if (sButtonType === 'primary') {
      switch (sAction) {
        case 'finishAssignment': {
          const finishPromise = finishAssignment(itemKey);

          finishPromise
            .then(() => {})
            .catch(() => {
              showToast(`${localizedVal('Submit failed!', localeCategory)}`);
            });

          break;
        }

        case 'approveCase': {
          const approvePromise = approveCase(itemKey);

          approvePromise
            .then(() => {})
            .catch(() => {
              showToast(`${localizedVal('Approve failed!', localeCategory)}`);
            });

          break;
        }

        default:
          break;
      }
    }
  }

  function getRefreshProps(refreshConditions: any) {
    // refreshConditions cuurently supports only "Changes" event
    if (!refreshConditions) {
      return [];
    }

    return refreshConditions.filter((item: any) => item.event && item.event === 'Changes')
                            .map((item: any) => [item.field, item.field?.substring(1)]) || [];
  }

  // expected format of refreshConditions : [{field: ".Name", event: "Changes"}]
  // @ts-ignore - Property 'getActionRefreshConditions' is private and only accessible within class 'CaseInfo'
  const refreshConditions = thePConn.getCaseInfo()?.getActionRefreshConditions();
  const context = thePConn.getContextName();
  const pageReference = thePConn.getPageReference();

  // refresh api de-registration
  PCore.getRefreshManager().deRegisterForRefresh(context);

  // refresh api registration
  const refreshProps = getRefreshProps(refreshConditions);
  const caseKey = thePConn.getCaseInfo().getKey();
  const refreshOptions = {
    autoDetectRefresh: true,
    preserveClientChanges: false
  };

  if (refreshProps.length > 0) {
    refreshProps.forEach((prop: any) => {
      PCore.getRefreshManager().registerForRefresh(
        'PROP_CHANGE',
        thePConn.getActionsApi().refreshCaseView.bind(thePConn.getActionsApi(), caseKey, '', pageReference, {
          ...refreshOptions,
          refreshFor: prop[0]
        }),
        `${pageReference}.${prop[1]}`,
        `${context}/${pageReference}`,
        context
      );
    });
  }

  return (
    <div id='Assignment'>
      {banners}
      {bHasNavigation ? (
        <MultiStep
          actionButtons={actionButtons}
          arCurrentStepIndicies={arCurrentStepIndicies}
          arNavigationSteps={arNavigationSteps}
          bIsVertical={bIsVertical}
          getPConnect={getPConnect}
          itemKey={itemKey}
          onButtonPress={buttonPress}
        >
          {children}
        </MultiStep>
      ) : (
        <AssignmentCard
        actionButtons={actionButtons}
        getPConnect={getPConnect}
        itemKey={itemKey}
        onButtonPress={buttonPress}
        >
          {children}
        </AssignmentCard>
      )}
      <Drawer
      isOpen={isOpen}
      placement='bottom'
      radius='none'
      size='xs'
      onOpenChange={onOpenChange}
      >
        <DrawerContent>
          {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (onClose) => (
              <DrawerHeader className="mx-4">
                {snackbarMessage}
              </DrawerHeader>
            )
          }
        </DrawerContent>
      </Drawer>
    </div>
  );
}
