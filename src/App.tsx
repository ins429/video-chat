import React, { useEffect, useRef } from "react";
import logo from "./logo.svg";
import "./App.css";

import {
  CallClient,
  VideoStreamRenderer,
  LocalVideoStream,
} from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { AzureLogger, setLogLevel } from "@azure/logger";

function App() {
  useEffect(() => {
    setLogLevel("verbose");
    AzureLogger.log = (...args: any[]) => {
      console.log(...args);
    };
  }, []);

  return (
    <div>
      <h4>Azure Communication Services - Calling Web SDK</h4>
      <input
        id="user-access-token"
        type="text"
        placeholder="User access token"
        style={{ marginBottom: "1em", width: "500px" }}
      />
      <button id="initialize-call-agent" type="button">
        Initialize Call Agent
      </button>
      <br />
      <br />
      <input
        id="callee-acs-user-id"
        type="text"
        placeholder="Enter callee's Azure Communication Services user identity in format: '8:acs:resourceId_userId'"
        style={{ marginBottom: "1em", width: "500px", display: "block" }}
      />
      <button id="start-call-button" type="button" disabled={true}>
        Start Call
      </button>
      <button id="hangup-call-button" type="button" disabled={true}>
        Hang up Call
      </button>
      <button id="accept-call-button" type="button" disabled={true}>
        Accept Call
      </button>
      <button id="start-video-button" type="button" disabled={true}>
        Start Video
      </button>
      <button id="stop-video-button" type="button" disabled={true}>
        Stop Video
      </button>
      <br />
      <br />
      <div id="connectedLabel" style={{ color: "#13bb13" }} hidden>
        Call is connected!
      </div>
      <br />
      <div id="remoteVideosGallery" style={{ width: "40%;" }} hidden>
        Remote participants' video streams:
      </div>
      <br />
      <div id="localVideoContainer" style={{ width: "30%" }} hidden>
        Local video stream:
      </div>
    </div>
  );
}

export default App;
