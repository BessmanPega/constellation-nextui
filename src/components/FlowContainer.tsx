/* eslint-disable no-nested-ternary */

import { useState, useEffect, useContext } from 'react';
import { Alert, Card } from '@nextui-org/react';
import { Utils } from '@pega/react-sdk-components/lib/components/helpers/utils';
import { isContainerInitialized } from '@pega/react-sdk-components/lib/components/infra/Containers/helpers';
import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { withSimpleViewContainerRenderer } from '@pega/react-sdk-components/lib/components/infra/Containers/SimpleView/SimpleView';
import { addContainerItem, getToDoAssignments, showBanner, hasContainerItems } from '@pega/react-sdk-components/lib/components/infra/Containers/FlowContainer/helpers';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';


interface FlowContainerProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  pageMessages: any[];
  rootViewElement: React.ReactNode;
  getPConnectOfActiveContainerItem: Function;
  assignmentNames: string[];
  activeContainerItemID: string;
}

export const FlowContainer = (props: FlowContainerProps) => {
  // Get the proper implementation (local or Pega-provided) for these components that are emitted below
  const Assignment = getComponentFromMap('Assignment');
  const ToDo = getComponentFromMap('Todo'); // NOTE: ConstellationJS Engine uses "Todo" and not "ToDo"!!!

  const pCoreConstants = PCore.getConstants();
  const { TODO } = pCoreConstants;
  const todo_headerText = 'To do';

  const {
    getPConnect: getPConnectOfFlowContainer,
    pageMessages,
    rootViewElement,
    getPConnectOfActiveContainerItem,
    assignmentNames,
    activeContainerItemID: itemKey
  } = props;

  const pConnectOfFlowContainer = getPConnectOfFlowContainer();
  const isInitialized = isContainerInitialized(pConnectOfFlowContainer);
  const hasItems = isInitialized && hasContainerItems(pConnectOfFlowContainer);
  const getPConnect = getPConnectOfActiveContainerItem || getPConnectOfFlowContainer;
  const thePConn = getPConnect();
  const containerName = assignmentNames && assignmentNames.length > 0 ? assignmentNames[0] : '';
  // const [init, setInit] = useState(true);
  // const [fcState, setFCState] = useState({ hasError: false });

  const [todo_showTodo, setShowTodo] = useState(false);
  const [todo_caseInfoID, setCaseInfoID] = useState('');
  const [todo_showTodoList, setShowTodoList] = useState(false);
  const [todo_datasource, setTodoDatasource] = useState({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [todo_context, setTodoContext] = useState('');

  const [caseMessages, setCaseMessages] = useState('');
  const [bHasCaseMessages, setHasCaseMessages] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [checkSvg, setCheckSvg] = useState('');

  const [buildName, setBuildName] = useState('');
  const [bShowConfirm, setShowConfirm] = useState(false);
  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const localeCategory = 'Messages';

  const key = `${thePConn.getCaseInfo().getClassName()}!CASE!${thePConn.getCaseInfo().getName()}`.toUpperCase();

  function getBuildName(): string {
    const ourPConn = getPConnect();

    // let { getPConnect, name } = this.pConn$.pConn;
    const context = ourPConn.getContextName();
    let viewContainerName = ourPConn.getContainerName();

    if (!viewContainerName) viewContainerName = '';
    
    return `${context.toUpperCase()}/${viewContainerName.toUpperCase()}`;
  }

  function getTodoVisibility() {
    const caseViewMode = getPConnect().getValue('context_data.caseViewMode', ''); // 2nd arg empty string until typedefs properly allow optional

    if (caseViewMode && caseViewMode === 'review') {
      return true;
    }

    if (caseViewMode && caseViewMode === 'perform') {
      return false;
    }

    return true;
  }

  function initComponent() {
    const ourPConn = getPConnect();

    // debugging/investigation help
    // console.log(`${ourPConn.getComponentName()}: children update for main draw`);

    // const oData = ourPConn.getDataObject();

    // const activeActionLabel = "";
    // const child0_getPConnect = arNewChildren[0].getPConnect();

    // this.templateName$ = this.configProps$["template"];

    // debugger;
    setShowTodo(getTodoVisibility());

    ourPConn.isBoundToState();

    // debugger;
    setBuildName(getBuildName());
  }

  useEffect(() => {
    // from WC SDK connectedCallback (mount)
    initComponent();
  }, []);

  useEffect(() => {
    // @ts-ignore - Property 'getMetadata' is private and only accessible within class 'C11nEnv'
    if (isInitialized && pConnectOfFlowContainer.getMetadata().children && !hasItems) {
      // ensuring not to add container items, if container already has items
      // because during multi doc mode, we will have container items already in store
      addContainerItem(pConnectOfFlowContainer);
    }
  }, [isInitialized, hasItems]);

  function isCaseWideLocalAction() {
    const ourPConn = getPConnect();

    const actionID = ourPConn.getValue(pCoreConstants.CASE_INFO.ACTIVE_ACTION_ID, ''); // 2nd arg empty string until typedefs properly allow optional
    const caseActions = ourPConn.getValue(pCoreConstants.CASE_INFO.AVAILABLEACTIONS, ''); // 2nd arg empty string until typedefs properly allow optional
    let bCaseWideAction = false;

    if (caseActions && actionID) {
      const actionObj = caseActions.find((caseAction: any) => caseAction.ID === actionID);

      if (actionObj) {
        bCaseWideAction = actionObj.type === 'Case';
      }
    }

    return bCaseWideAction;
  }

  function hasChildCaseAssignments() {
    const ourPConn = getPConnect();

    const childCases = ourPConn.getValue(pCoreConstants.CASE_INFO.CHILD_ASSIGNMENTS, ''); // 2nd arg empty string until typedefs properly allow optional
    // const allAssignments = [];

    if (childCases && childCases.length > 0) {
      return true;
    }

    return false;
  }

  function hasAssignments() {
    const ourPConn = getPConnect();

    let bHasAssignments = false;
    const assignmentsList: any[] = ourPConn.getValue(pCoreConstants.CASE_INFO.D_CASE_ASSIGNMENTS_RESULTS, ''); // 2nd arg empty string until typedefs properly allow optional
    const isEmbedded = window.location.href.includes('embedded');
    let bAssignmentsForThisOperator = false;

    //  See if there are any assignments for the current operator
    if (isEmbedded) {
      const thisOperator = PCore.getEnvironmentInfo().getOperatorIdentifier();

      for (const assignment of assignmentsList) {
        if (assignment.assigneeInfo.ID === thisOperator) {
          bAssignmentsForThisOperator = true;
        }
      }
    } else {
      bAssignmentsForThisOperator = true;
    }

    // Bail out if there isn't an assignmentsList
    if (!assignmentsList) {
      return bHasAssignments;
    }

    const bHasChildCaseAssignments = hasChildCaseAssignments();

    if (bAssignmentsForThisOperator || bHasChildCaseAssignments || isCaseWideLocalAction()) {
      bHasAssignments = true;
    }

    return bHasAssignments;
  }

  // From SDK-WC updateSelf - so do this in useEffect that's run only when the props change...
  useEffect(() => {
    setBuildName(getBuildName());

    // routingInfo was added as component prop in populateAdditionalProps
    // let routingInfo = this.getComponentProp("routingInfo");

    let loadingInfo: any;

    try {
      loadingInfo = thePConn.getLoadingStatus(''); // 1st arg empty string until typedefs properly allow optional
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.error(`${thePConn.getComponentName()}: loadingInfo catch block`);
    }

    // let configProps = this.thePConn.resolveConfigProps(this.thePConn.getConfigProps());

    if (!loadingInfo) {
      // turn off spinner
      // this.psService.sendMessage(false);
    }

    const caseViewMode = thePConn.getValue('context_data.caseViewMode', ''); // 2nd arg empty string until typedefs properly allow optional
    const { CASE_INFO: CASE_CONSTS } = pCoreConstants;

    if (caseViewMode && caseViewMode === 'review') {
      setTimeout(() => {
        // updated for 8.7 - 30-Mar-2022
        const todoAssignments = getToDoAssignments(thePConn);

        if (todoAssignments && todoAssignments.length > 0) {
          setCaseInfoID(thePConn.getValue(CASE_CONSTS.CASE_INFO_ID, '')); // 2nd arg empty string until typedefs properly allow optional
          setTodoDatasource({ source: todoAssignments });
        }
        setShowTodo(true);
        setShowTodoList(false);
      }, 100);
    } else if (caseViewMode && caseViewMode === 'perform') {
      // perform
      // debugger;
      setShowTodo(false);
    }

    // if have caseMessage show message and end
    const theCaseMessages = localizedVal(thePConn.getValue('caseMessages', ''), localeCategory); // 2nd arg empty string until typedefs properly allow optional

    // caseMessages's behavior has changed in 24.2, and hence it doesn't let Optional Action work.
    // Changing the below condition for now. Was: (theCaseMessages || !hasAssignments())
    if (!hasAssignments()) {
      // Temp fix for 8.7 change: confirmationNote no longer coming through in caseMessages$.
      // So, if we get here and caseMessages$ is empty, use default value in DX API response
      setCaseMessages(theCaseMessages || localizedVal('Thank you! The next step in this case has been routed appropriately.', localeCategory));
      setHasCaseMessages(true);
      setShowConfirm(true);

      // publish this "assignmentFinished" for mashup, need to get approved as a standard
      // @ts-ignore - second parameter “payload” for publish method should be optional
      PCore.getPubSubUtils().publish('assignmentFinished');

      // debugger;
      setCheckSvg(Utils.getImageSrc('check', Utils.getSDKStaticConentUrl()));
    } else {
      // debugger;
      setHasCaseMessages(false);
      setShowConfirm(false);
    }
  }, [props]);

  const bShowBanner = showBanner(getPConnect);

  const displayPageMessages = () => {
    let hasBanner = false;
    const messages = pageMessages ? pageMessages.map(msg => localizedVal(msg.message, 'Messages')) : pageMessages;
    
    hasBanner = messages && messages.length > 0;

    return hasBanner && <div className="w-full px-4"><Alert className="my-4" color='warning' >{messages}</Alert></div>;
  };

  return (
    <div id={buildName}>
      {!bShowConfirm &&
        (!todo_showTodo ? (
          <Card className="items-start">
            <span className="px-4 py-2 text-lg">{localizedVal(containerName, undefined, key)}</span>
            {displayPageMessages()}
            {bHasCaseMessages && ( <Alert hideIcon color='success'>{caseMessages}</Alert> )}
            <Assignment getPConnect={getPConnect} itemKey={itemKey}>
              {rootViewElement}
            </Assignment>
          </Card>
        ) : (
          <ToDo
          key={Math.random()}
          isConfirm
          caseInfoID={todo_caseInfoID}
          context={todo_context}
          datasource={todo_datasource}
          getPConnect={getPConnect}
          headerText={todo_headerText}
          itemKey={itemKey}
          showTodoList={todo_showTodoList}
          type={TODO}
          />
      ))}
      {bShowConfirm && bShowBanner && <div>{rootViewElement}</div>}
    </div>
  );
};

export default withSimpleViewContainerRenderer(FlowContainer);