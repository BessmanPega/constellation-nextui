/* eslint-disable no-console */
import { useEffect, useMemo, useState } from 'react';
import { loginIfNecessary, sdkIsLoggedIn } from '@pega/auth/lib/sdk-auth-manager';
import { getSdkComponentMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import { compareSdkPCoreVersions } from '@pega/react-sdk-components/lib/components/helpers/versionHelpers';
import StoreContext from '@pega/react-sdk-components/lib/bridge/Context/StoreContext';
import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';
import { Button } from "@nextui-org/button";

import localSdkComponentMap from '../../sdk-local-component-map';

import DefaultLayout from "@/layouts/default";

declare const myLoadMashup: any;

function RootComponent(props: any) {
  const PegaConnectObj = createPConnectComponent();
  const thePConnObj = <PegaConnectObj {...props} />;

  /**
   * NOTE: For Embedded mode, we add in displayOnlyFA to our React context
   * so it is available to any component that may need it.
   * VRS: Attempted to remove displayOnlyFA but it presently handles various components which
   * SDK does not yet support, so all those need to be fixed up before it can be removed.
   * To be done in a future sprint.
   */
  const contextValue = useMemo(() => {
    return { store: PCore.getStore(), displayOnlyFA: true };
  }, [PCore.getStore()]);

  return <StoreContext.Provider value={contextValue}>{thePConnObj}</StoreContext.Provider>;
}

export default function HelloPega() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rootProps, setRootProps] = useState({});
  const [caseCreated, setCaseCreated] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      // Add event listener for when logged in and constellation bootstrap is loaded
      document.addEventListener('SdkConstellationReady', () => handleSdkConstellationReady());

      // this function will handle login process, and SdkConstellationReady event will be fired once PCore is ready
      loginIfNecessary({ appName: 'embedded', mainRedirect: false });

      if (!isLoggedIn && sdkIsLoggedIn()) {
        console.log("Looks like you clicked away and back again, let's try to get ourselves into a usable condition...");
        handleSdkConstellationReady();
      }
    } catch (error) {
      console.error('Something went wrong during login', error);
    }
  };

  const initializeRootContainerProps = (renderObj: any) => {
    const { props } = renderObj;

    console.log("This better contain getPConnect() or we're hosed:", props);

    setRootProps(props);
  };

  const startMashup = () => {
    PCore.onPCoreReady(async (renderObj: any) => {
      // Check that we're seeing the PCore version we expect
      compareSdkPCoreVersions();

      await getSdkComponentMap(localSdkComponentMap);

      // Don't call initializeRootContainerProps until SdkComponentMap is fully initialized
      initializeRootContainerProps(renderObj);
    });

    myLoadMashup('pega-root', false); // this is defined in bootstrap shell that's been loaded already
  };

  const handleSdkConstellationReady = () => {
    setIsLoggedIn(true);

    startMashup();
  };

  const createCaseButtonClicked = async () => {
    setCaseCreated(true);

    // Create options object with default values
    const options: any = {
      pageName: 'pyEmbedAssignment',
      startingFields: {
        Package: 'Basic'
      }
    };

    // Create a new case using the mashup API
    PCore.getMashupApi()
      .createCase('DIXL-MediaCo-Work-NewService', PCore.getConstants().APP.APP, options)
      .then(() => {
        console.log('createCase rendering is complete');
      });
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center">
        <div className="inline-block text-center justify-center">
          {isLoggedIn? (
            caseCreated? ( null ) : (<Button onClick={createCaseButtonClicked}>Create case</Button>)
          ) : (
            <h3>Logging in...</h3>
          )}
          {caseCreated && (
            <RootComponent {...rootProps} />
          )}
        </div>
      </section>
    </DefaultLayout>
  );
}
