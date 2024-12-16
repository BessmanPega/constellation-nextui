/* eslint-disable no-console */
import { useEffect, useMemo, useState } from 'react';
import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { getSdkConfig, loginIfNecessary, sdkSetAuthHeader, sdkSetCustomTokenParamsCB } from '@pega/auth/lib/sdk-auth-manager';
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

  const initializeAuthentication = (sdkConfigAuth: any) => {
    console.log("Begin initializeAuthentication()");

    if ((sdkConfigAuth.mashupGrantType === 'none' || !sdkConfigAuth.mashupClientId) && sdkConfigAuth.customAuthType === 'Basic') {
      // Service package to use custom auth with Basic
      const sB64 = window.btoa(`${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}`);
      
      sdkSetAuthHeader(`Basic ${sB64}`);
    }
  
    if ((sdkConfigAuth.mashupGrantType === 'none' || !sdkConfigAuth.mashupClientId) && sdkConfigAuth.customAuthType === 'BasicTO') {
      const now = new Date();
      const expTime = new Date(now.getTime() + 5 * 60 * 1000);
      let sISOTime = `${expTime.toISOString().split('.')[0]}Z`;
      const regex = /[-:]/g;
  
      sISOTime = sISOTime.replace(regex, '');
  
      // Service package to use custom auth with Basic
      const sB64 = window.btoa(`${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}:${sISOTime}`);
      
      sdkSetAuthHeader(`Basic ${sB64}`);
    }
  
    if (sdkConfigAuth.mashupGrantType === 'customBearer' && sdkConfigAuth.customAuthType === 'CustomIdentifier') {
      // Use custom bearer with specific custom parameter to set the desired operator via
      //  a userIdentifier property.  (Caution: highly insecure...being used for simple demonstration)
      sdkSetCustomTokenParamsCB(() => {
        console.log("sdkSetCustomTokenParamsCB() callback invoked");

        return { userIdentifier: sdkConfigAuth.mashupUserIdentifier };
      });
    }

    console.log("End initializeAuthentication()");
  }

  const initialize = async () => {
    console.log("Begin initialize()");

    try {
      // Add event listener for when logged in and constellation bootstrap is loaded
      document.addEventListener('SdkConstellationReady', () => handleSdkConstellationReady());

      const { authConfig } = await getSdkConfig();

      initializeAuthentication(authConfig);

      // this function will handle login process, and SdkConstellationReady event will be fired once PCore is ready
      loginIfNecessary({ appName: 'embedded', mainRedirect: false });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Something went wrong while login', error);
    }

    console.log("End initialize()");
  };

  const initializeRootContainerProps = (renderObj: any) => {
    console.log("Begin initializeRootContainerProps()");

    const { props } = renderObj;

    setRootProps(props);

    console.log("End initializeRootContainerProps()");
  };

  const startMashup = () => {
    console.log("Begin startMashup()");

    PCore.onPCoreReady(async (renderObj: any) => {
      console.log("Begin PCore.onPCoreReady() callback");

      // Check that we're seeing the PCore version we expect
      compareSdkPCoreVersions();

      await getSdkComponentMap(localSdkComponentMap);

      // Don't call initializeRootContainerProps until SdkComponentMap is fully initialized
      initializeRootContainerProps(renderObj);

      console.log("End PCore.onPCoreReady() callback");
    });

    myLoadMashup('pega-root', false); // this is defined in bootstrap shell that's been loaded already

    console.log("End startMashup()");
  };

  const handleSdkConstellationReady = () => {
    console.log("Begin handleSdkConstellationReady()");

    setIsLoggedIn(true);

    startMashup();

    console.log("End handleSdkConstellationReady()");
  };

  const createCaseButtonClicked = async () => {
    console.log("Begin createCaseButtonClicked()");
    
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
        // eslint-disable-next-line no-console
        console.log('createCase rendering is complete');
      });


    console.log("End createCaseButtonClicked()");
  }
  
  const defaultTheme = createTheme({});
  
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center">
        <div className="inline-block text-center justify-center">
          {isLoggedIn? (
            caseCreated? ( null ) : (<Button onClick={createCaseButtonClicked}>Create case</Button>)
          ) : (
            <h3>Logging in...</h3>
          )}
          {caseCreated? (
            <StyledEngineProvider injectFirst>
              <ThemeProvider theme={defaultTheme}>
                <CssBaseline />
                <RootComponent {...rootProps} />
              </ThemeProvider>
            </StyledEngineProvider>
          ) : null }
        </div>
      </section>
    </DefaultLayout>
  );
}
