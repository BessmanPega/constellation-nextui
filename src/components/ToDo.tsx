/* eslint-disable @typescript-eslint/no-shadow */
import {
  Alert,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Link,
} from "@nextui-org/react";
import { PConnProps } from "@pega/react-sdk-components/lib/types/PConnProps";

interface ToDoProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  datasource?: any;
  myWorkList?: any;
  // eslint-disable-next-line react/no-unused-prop-types
  caseInfoID?: string;
  headerText?: string;
  // eslint-disable-next-line react/no-unused-prop-types
  itemKey?: string;
  showTodoList?: boolean;
  type?: string;

  context?: string;
  isConfirm?: boolean;
}

export default function ToDo(props: ToDoProps) {
  const { itemKey = "" } = props;

  const messages = PCore.getStoreValue(
    "caseMessages",
    "",
    itemKey,
  ) as Array<string>;
  const businessID = PCore.getStoreValue("caseInfo.businessID", "", itemKey);

  function mailHref() {
    return `mailto:support@example.com?subject=Help with request ${businessID}`;
  }

  return (
    <div className="max-w-prose justify-self-center">
      <Card className="m-4">
        <CardHeader>
          <p className="text-lg">
            Your request ID is <span className="font-bold">{businessID}</span>
          </p>
        </CardHeader>
        <Divider />
        <CardBody>
          <p>
            We received your request and are working diligently to fulfill it.
            You should hear back from us within 3-5 business days. Acme
            appreciates your business!
          </p>
        </CardBody>
        <Divider />
        <CardFooter>
          <p className="text-sm">
            Email <Link className="text-sm" href={mailHref()}>support@example.com</Link> for help
          </p>
        </CardFooter>
      </Card>
      {messages.map((message: string) => (
        <div key={message} className="m-4 text-left">
          <Alert color="success">
            {message}
          </Alert>
        </div>
      ))}
    </div>
  );
}
