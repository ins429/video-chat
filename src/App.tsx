import React, {useCallback, useEffect, useRef, useState} from "react";
import "./App.css";

import {
  CallAgent,
  CallClient,
  VideoStreamRenderer,
  LocalVideoStream,
} from "@azure/communication-calling";
import {AzureCommunicationTokenCredential} from "@azure/communication-common";
import {AzureLogger, setLogLevel} from "@azure/logger";

import {acsId, token} from "./creds";

function uuidv4() {
  // @ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}


function App() {
  const localVideoContainer = useRef(null);
  const remoteVideosGallery = useRef(null);
  const [calleeAcsUserId, setCalleeAcsUserId] = useState(acsId);
  const [userAccessToken, setUserAccessToken] = useState(token);
  const [isLocalVideoContainerHidden, setIslocalVideoContainerHidden] =
    useState(true);
  const [isConnectedLabelHidden, setIsConnectedLabelHidden] = useState(true);
  const [isRemoteVideosGalleryHidden, setIsRemoteVideosGalleryHidden] =
    useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [callAgent, setCallAgent] = useState<CallAgent | null>(null);
  const [deviceManager, setDeviceManager] = useState(null);
  const [call, setCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [localVideoStream, setLocalVideoStream] = useState(null);
  const [localVideoStreamRenderer, setLocalVideoStreamRenderer] =
    useState(null);

  // @ts-ignore
  const subscribeToCall = useCallback((call) => {
    try {
      // Inspect the initial call.id value.
      console.log(`pjlee Call Id: ${call.id}`);
      //Subscribe to call's 'idChanged' event for value changes.
      call.on("idChanged", () => {
        console.log(`pjlee Call Id changed: ${call.id}`);
      });

      // Inspect the initial call.state value.
      console.log(`pjlee Call state: ${call.state}`);
      // Subscribe to call's 'stateChanged' event for value changes.
      call.on("stateChanged", async () => {
        console.log(`pjlee Call state changed: ${call.state}`);
        if (call.state === "Connected") {
          setIsConnected(true);
        } else if (call.state === "Disconnected") {
          setIsConnected(false);
          console.log(
            `pjlee Call ended, call end reason={code=${call.callEndReason.code}, subCode=${call.callEndReason.subCode}}`,
            call,
            call.callEndReason
          );
        }
      });

      // @ts-ignore
      call.localVideoStreams.forEach(async (lvs) => {
        console.log("pjlee call.localVideoStreams", lvs);
        setLocalVideoStream(lvs);
        await displayLocalVideoStream(lvs);
      });
      // @ts-ignore
      call.on("localVideoStreamsUpdated", (e) => {
        console.log("pjlee localVideoStreamsUpdated", e);
        // @ts-ignore
        e.added.forEach(async (lvs) => {
          console.log('pjlee 000', lvs)
          setLocalVideoStream(lvs);
          await displayLocalVideoStream(lvs);
        });
        // @ts-ignore
        e.removed.forEach((lvs) => {
          console.log('pjlee 111', lvs)
          removeLocalVideoStream();
        });
      });

      // Inspect the call's current remote participants and subscribe to them.
      // @ts-ignore
      call.remoteParticipants.forEach((remoteParticipant) => {
        subscribeToRemoteParticipant(remoteParticipant);
      });
      // Subscribe to the call's 'remoteParticipantsUpdated' event to be
      // notified when new participants are added to the call or removed from the call.
      // @ts-ignore
      call.on("remoteParticipantsUpdated", (e) => {
        // Subscribe to new remote participants that are added to the call.
        // @ts-ignore
        e.added.forEach((remoteParticipant) => {
          subscribeToRemoteParticipant(remoteParticipant);
        });
        // Unsubscribe from participants that are removed from the call
        // @ts-ignore
        e.removed.forEach((remoteParticipant) => {
          console.log("Remote participant removed from the call.");
        });
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const createLocalVideoStream = useCallback(async () => {
    // @ts-ignore
    const camera = (await deviceManager.getCameras())[0];
    if (camera) {
      return new LocalVideoStream(camera);
    } else {
      console.error(`No camera device found on the system`);
    }
  }, [deviceManager]);

  const displayLocalVideoStream = useCallback(
    async (lvs: any) => {
      try {
        console.log("pjlee displayLocalVideoStream localVideoStream", lvs);
        const _localVideoStreamRenderer = new VideoStreamRenderer(
          // @ts-ignore
          lvs
        );
        // @ts-ignore
        const view = await _localVideoStreamRenderer.createView();
        console.log("pjlee view", view);
        // @ts-ignore
        setLocalVideoStreamRenderer(_localVideoStreamRenderer);
        // @ts-ignore
        localVideoContainer.current?.appendChild(view.target);
        setIslocalVideoContainerHidden(false);
      } catch (error) {
        console.error("pjlee err displayLocalVideoStream", {
          error,
          lvs,
        });
      }
    },
    [setIslocalVideoContainerHidden]
  );

  const removeLocalVideoStream = useCallback(async () => {
    try {
      // @ts-ignore
      localVideoStreamRenderer?.dispose();
      setIslocalVideoContainerHidden(true);
    } catch (error) {
      console.error(error);
    }
  }, [setIslocalVideoContainerHidden]);

  // @ts-ignore
  const subscribeToRemoteParticipant = useCallback((remoteParticipant) => {
    try {
      // Inspect the initial remoteParticipant.state value.
      console.log(`Remote participant state: ${remoteParticipant.state}`);
      // Subscribe to remoteParticipant's 'stateChanged' event for value changes.
      remoteParticipant.on("stateChanged", () => {
        console.log(
          `Remote participant state changed: ${remoteParticipant.state}`
        );
      });

      // Inspect the remoteParticipants's current videoStreams and subscribe to them.
      // @ts-ignore
      remoteParticipant.videoStreams.forEach((remoteVideoStream) => {
        subscribeToRemoteVideoStream(remoteVideoStream);
      });
      // Subscribe to the remoteParticipant's 'videoStreamsUpdated' event to be
      // notified when the remoteParticiapant adds new videoStreams and removes video streams.
      // @ts-ignore
      remoteParticipant.on("videoStreamsUpdated", (e) => {
        // Subscribe to new remote participant's video streams that were added.
        // @ts-ignore
        e.added.forEach((remoteVideoStream) => {
          subscribeToRemoteVideoStream(remoteVideoStream);
        });
        // Unsubscribe from remote participant's video streams that were removed.
        // @ts-ignore
        e.removed.forEach((remoteVideoStream) => {
          console.log("Remote participant video stream was removed.");
        });
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const subscribeToRemoteVideoStream = useCallback(
    // @ts-ignore
    async (remoteVideoStream) => {
      let renderer = new VideoStreamRenderer(remoteVideoStream);
      // @ts-ignore
      let view;
      let remoteVideoContainer = document.createElement("div");
      remoteVideoContainer.className = "remote-video-container";

      /**
     * isReceiving API is currently a @beta feature.
     * To use this api, please use 'beta' version of Azure Communication Services Calling Web SDK.
     * Create a CSS class to style your loading spinner.
     *
    let loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';
    remoteVideoStream.on('isReceivingChanged', () => {
        try {
            if (remoteVideoStream.isAvailable) {
                const isReceiving = remoteVideoStream.isReceiving;
                const isLoadingSpinnerActive = remoteVideoContainer.contains(loadingSpinner);
                if (!isReceiving && !isLoadingSpinnerActive) {
                    remoteVideoContainer.appendChild(loadingSpinner);
                } else if (isReceiving && isLoadingSpinnerActive) {
                    remoteVideoContainer.removeChild(loadingSpinner);
                }
            }
        } catch (e) {
            console.error(e);
        }
    });
    */

      const createView = async () => {
        // Create a renderer view for the remote video stream.
        view = await renderer.createView();
        // Attach the renderer view to the UI.
        remoteVideoContainer.appendChild(view.target);
        // @ts-ignore
        remoteVideosGallery.current?.appendChild(remoteVideoContainer);
      };

      // Remote participant has switched video on/off
      remoteVideoStream.on("isAvailableChanged", async () => {
        try {
          if (remoteVideoStream.isAvailable) {
            await createView();
          } else {
            // @ts-ignore
            view.dispose();
            // @ts-ignore
            remoteVideosGallery.current?.removeChild(remoteVideoContainer);
          }
        } catch (e) {
          console.error(e);
        }
      });

      // Remote participant has video on initially.
      if (remoteVideoStream.isAvailable) {
        try {
          await createView();
        } catch (e) {
          console.error(e);
        }
      }
    },
    []
  );

  useEffect(() => {
    // setLogLevel("verbose");
    setLogLevel("error");
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
        style={{marginBottom: "1em", width: "500px"}}
        value={userAccessToken}
        onChange={(e) => setUserAccessToken(e.target.value)}
      />
      <button
        id="initialize-call-agent"
        type="button"
        onClick={async () => {
          try {
            console.log("pjlee 0");
            const callClient = new CallClient();
            console.log("pjlee 1");
            const tokenCredential = new AzureCommunicationTokenCredential(
              userAccessToken.trim()
            );
            console.log("pjlee", {tokenCredential});
            const _callAgent = await callClient.createCallAgent(
              tokenCredential
            );
            console.log("pjlee", {_callAgent});
            // Set up a camera device to use.
            const _deviceManager = await callClient.getDeviceManager();
            await _deviceManager.askDevicePermission({
              audio: true,
              video: true,
            });
            // Listen for an incoming call to accept.
            _callAgent.on("incomingCall", async (args) => {
              try {
                const _incomingCall = args.incomingCall;
                // @ts-ignore
                setIncomingCall(_incomingCall);
                // acceptCallButton.disabled = false;
                // startCallButton.disabled = true;
              } catch (error) {
                console.error(error);
              }
            });
            setCallAgent(_callAgent);
            // @ts-ignore
            setDeviceManager(_deviceManager);

            // startCallButton.disabled = false;
            // initializeCallAgentButton.disabled = true;
          } catch (error) {
            console.error(error);
          }
        }}
      >
        Initialize Call Agent
      </button>
      <br />
      <br />
      <input
        id="callee-acs-user-id"
        type="text"
        placeholder="Enter callee's Azure Communication Services user identity in format: '8:acs:resourceId_userId'"
        style={{marginBottom: "1em", width: "500px", display: "block"}}
        value={calleeAcsUserId}
        onChange={(e) => setCalleeAcsUserId(e.target.value)}
      />
      <button
        id="start-call-button"
        type="button"
        disabled={!callAgent}
        onClick={async () => {
          try {
            if (!callAgent) {
              console.log("call agent not ready");
            }
            const localVideoStream = await createLocalVideoStream();
            console.log("pjlee start call localVideoStream", localVideoStream);
            const videoOptions = localVideoStream
              ? {localVideoStreams: [localVideoStream]}
              : undefined;
            // const groupId = uuidv4()
            const groupId = "c385a2d0-3e8a-456d-bc64-68a6f717d3aa";
            // @ts-ignore
            const _call = callAgent?.join(
              {groupId},
              {videoOptions}
            );

            console.log('pjlee call started', {_call, groupId});
            // Subscribe to the call's properties and events.
            subscribeToCall(_call);
            // @ts-ignore
            setCall(_call);
          } catch (error) {
            console.error(error);
          }
        }}
      >
        Start Call
      </button>
      <button
        id="hangup-call-button"
        type="button"
        disabled={!isConnected}
        onClick={async () => {
          // end the current call
          // @ts-ignore
          await call.hangUp();
        }}
      >
        Hang up Call
      </button>
      <button
        id="accept-call-button"
        type="button"
        disabled={true}
        onClick={async () => {
          try {
            const localVideoStream = await createLocalVideoStream();
            const videoOptions = localVideoStream
              ? {localVideoStreams: [localVideoStream]}
              : undefined;
            // @ts-ignore
            const _call = await incomingCall.accept({videoOptions});
            // Subscribe to the call's properties and events.
            subscribeToCall(_call);
            setCall(_call);
          } catch (error) {
            console.error(error);
          }
        }}
      >
        Accept Call
      </button>
      <button
        id="start-video-button"
        type="button"
        disabled={true}
        onClick={async () => {
          try {
            const localVideoStream = await createLocalVideoStream();
            // @ts-ignore
            await call.startVideo(localVideoStream);
          } catch (error) {
            console.error(error);
          }
        }}
      >
        Start Video
      </button>
      <button
        id="stop-video-button"
        type="button"
        disabled={true}
        onClick={async () => {
          try {
            // @ts-ignore
            await call.stopVideo(localVideoStream);
          } catch (error) {
            console.error(error);
          }
        }}
      >
        Stop Video
      </button>
      <br />
      <br />
      <div
        id="connectedLabel"
        style={{color: "#13bb13"}}
        hidden={!isConnected}
      >
        Call is connected!
      </div>
      <br />
      <div
        ref={remoteVideosGallery}
        id="remoteVideosGallery"
        style={{width: "40%"}}
        hidden={!isConnected}
      >
        Remote participants' video streams:
      </div>
      <br />
      <div
        ref={localVideoContainer}
        style={{width: "30%"}}
        hidden={isLocalVideoContainerHidden}
      >
        Local video stream:
      </div>
    </div>
  );
}

export default App;
