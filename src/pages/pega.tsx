import { useState, useEffect } from "react";
import {
  getSdkConfig,
  loginIfNecessary,
  sdkSetAuthHeader,
  sdkSetCustomTokenParamsCB
} from "@pega/auth/lib/sdk-auth-manager";

function initializeAuthentication(sdkConfigAuth) {
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
      return { userIdentifier: sdkConfigAuth.mashupUserIdentifier };
    });
  }
}

declare const myLoadMashup: any;

export default function HelloPega() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rootProps, setRootProps] = useState({});

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
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
  };

  const initializeRootContainerProps = renderObj => {
    const { props } = renderObj;

    setRootProps(props);
  };

  const startMashup = () => {
    PCore.onPCoreReady(async renderObj => {
      // Check that we're seeing the PCore version we expect
      compareSdkPCoreVersions();

      await getSdkComponentMap(localSdkComponentMap);
      // eslint-disable-next-line no-console
      console.log(`SdkComponentMap initialized`);

      // Don't call initializeRootContainerProps until SdkComponentMap is fully initialized
      initializeRootContainerProps(renderObj);
    });

    myLoadMashup('pega-root', false); // this is defined in bootstrap shell that's been loaded already
  };

  const handleSdkConstellationReady = () => {
    setIsLoggedIn(true);

    startMashup();
  };

  return (
    <div>
      <h1>Hello, Pega!</h1>
    </div>
  );
}
