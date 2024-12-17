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

  function infoIcon() {
    return (
      <svg
        fill="solid"
        height="24"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-current w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <path d="M12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22ZM12.75 16C12.75 16.41 12.41 16.75 12 16.75C11.59 16.75 11.25 16.41 11.25 16L11.25 11C11.25 10.59 11.59 10.25 12 10.25C12.41 10.25 12.75 10.59 12.75 11L12.75 16ZM11.08 7.62C11.13 7.49 11.2 7.39 11.29 7.29C11.39 7.2 11.5 7.13 11.62 7.08C11.74 7.03 11.87 7 12 7C12.13 7 12.26 7.03 12.38 7.08C12.5 7.13 12.61 7.2 12.71 7.29C12.8 7.39 12.87 7.49 12.92 7.62C12.97 7.74 13 7.87 13 8C13 8.13 12.97 8.26 12.92 8.38C12.87 8.5 12.8 8.61 12.71 8.71C12.61 8.8 12.5 8.87 12.38 8.92C12.14 9.02 11.86 9.02 11.62 8.92C11.5 8.87 11.39 8.8 11.29 8.71C11.2 8.61 11.13 8.5 11.08 8.38C11.03 8.26 11 8.13 11 8C11 7.87 11.03 7.74 11.08 7.62Z" />
      </svg>
    );
  }

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
        <div key={message} className="m-4">
          <Alert color="success" icon={infoIcon}>
            {message}
          </Alert>
        </div>
      ))}
    </div>
  );
}
