import Peer, { DataConnection, MediaConnection } from "peerjs";
type PeerManagerOption = {
  nearPeerId: string;
  host?: string;
  port?: number;
  path?: string;
};

export class PeerManager {
  public nearPeer: Ref<Peer | undefined>;
  public nearPeerId: Ref<string>;
  public dataConnect: Ref<DataConnection | undefined>;
  public mediaConnect: Ref<MediaConnection | undefined>;
  public mediaStream: Ref<MediaStream | undefined>;
  public nearVideoElement: Ref<HTMLVideoElement | undefined>;
  public remoteVideoElement: Ref<HTMLVideoElement | undefined>;
  public elDialogVisible: Ref<boolean>;
  public remotePeerId: Ref<string>;
  public remoteUser: Ref<ChatUserInfo> | undefined;
  constructor() {
    this.nearPeer = ref<Peer>();
    this.nearPeerId = ref("");
    this.dataConnect = ref<DataConnection>();
    this.mediaConnect = ref<MediaConnection>();
    this.mediaStream = ref<MediaStream>();
    this.nearVideoElement = ref<HTMLVideoElement>();
    this.remoteVideoElement = ref<HTMLVideoElement>();
    this.elDialogVisible = ref(false);
    this.remotePeerId = ref("");
  }
  createPeer = (option: PeerManagerOption) => {
    // 初始化PeerJS实例
    this.nearPeer.value = new Peer(option.nearPeerId, {
      host: option.host || "webchatx.mayuan.work",
      port: option.port || 443,
      secure: true,
      path: option.path || "/api/peer",
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "stun:global.stun.twilio.com:3478",
          }, // 免费的Google STUN服务器
          {
            urls: "turn:webchatx.stun.mayuan.work:3478",
            username: "dxh",
            credential: "187139",
          },
        ],
      },
    });
    this.nearPeerId.value = option.nearPeerId;
    // 监听本地peer ID生成事件
    this.nearPeer.value?.on("open", async (id) => {
      if (id == this.nearPeerId.value) {
        console.log(`Local peer ID: ${this.nearPeerId.value}`);
      } else {
        throw new Error("NearPeerId Build Failure!");
      }
    });
    this.handleIncomingConnections();
  };
  cleanupResources = () => {
    if (this.mediaStream.value) {
      const tracks = this.mediaStream.value.getTracks();
      tracks.forEach((track) => track.stop());
      this.mediaStream.value = undefined;
    }
  };
  // 处理来自其他对端的连接请求
  handleIncomingConnections = () => {
    this.nearPeer.value?.on("connection", (dataConnection) => {
      this.dataConnect.value = dataConnection;
      dataConnection.on("data", async (data: any) => {
        console.log(`Received data:${data}`);
      });
    });
  };
  speakCall = async (video = true, audio = true) => {
    try {
      if (!(this.nearVideoElement.value && this.remoteVideoElement.value)) {
        throw new Error(
          "Both video elements must be defined to initiate a call"
        );
      }

      // Step 1: Send call request through data channel
      const callRequest = { type: "call_request", video, audio };
      let responseReceived = false;

      // Setup a listener for response on data channel
      const onResponse = (event: any) => {
        if (
          event.data.type === "call_response" &&
          event.data.from === this.remotePeerId.value
        ) {
          responseReceived = true;
          this.dataConnect.value?.removeListener("data", onResponse); // Remove the listener once response is received
          if (event.data.accepted) {
            // Proceed with media setup
            this.handleCallAccepted(video, audio);
          } else {
            console.log("Call request was declined.");
            this.releaseMediaStream(); // Clean up if call is not accepted
          }
        }
      };
      this.dataConnect.value?.addListener("data", onResponse);

      // Send the call request
      await this.dataConnect.value?.send(callRequest);

      // Optionally, add a timeout in case no response is received
      const timeoutPromise = new Promise(
        (_, reject) =>
          setTimeout(() => reject(new Error("No response from peer")), 10000) // Timeout after 10 seconds
      );

      // Wait for either a response or timeout
      await Promise.race([
        new Promise<void>((resolve) => responseReceived && resolve()),
        timeoutPromise,
      ]);
    } catch (error) {
      console.error("Error initiating call:", error);
      this.releaseMediaStream();
    }
  };

  handleCallAccepted = async (video: boolean, audio: boolean) => {
    try {
      this.mediaStream.value = await navigator.mediaDevices.getUserMedia({
        video,
        audio,
      });
      if (this.nearVideoElement.value) {
        this.nearVideoElement.value.srcObject = this.mediaStream.value;
        await this.waitForVideoReady(this.nearVideoElement.value);
      } else {
        ElMessage({
          type: "error",
          message: "video视频展示元素初始化失败,请刷新后重试",
        });
      }
      // ... rest of the media connection setup ...
    } catch (error) {
      console.error("Error setting up media after acceptance:", error);
      this.releaseMediaStream();
    }
  };
  listenCall = () => {
    this.nearPeer.value?.on("call", async (call: MediaConnection) => {
      try {
        // Hold the call object but don't answer yet; first send a request through data channel
        this.mediaConnect.value = call;

        // Simulate sending a call request via data channel (assuming dataConnect is already set up)
        await this.dataConnect.value?.send({
          type: "call_request",
          from: this.nearPeerId.value,
        });

        // Wait for user response via UI prompt before proceeding
        const userResponse = await this.showCallPrompt(call);
        if (!userResponse.accepted) {
          console.log("User declined the call.");
          call.close(); // If the user declines, close the call connection
          return;
        }

        // User accepted, now proceed with setting up media
        this.mediaConnect.value = call;
        await new Promise<void>((resolve) => {
          const callReady = () => {
            if (this.mediaStream.value) {
              clearTimeout(timeout);
              call.answer(this.mediaStream.value);
              resolve();
            } else {
              clearTimeout(timeout);
              timeout = setTimeout(callReady, 1000);
            }
          };
          let timeout = setTimeout(callReady, 1000);
        });

        call.on("stream", async (remoteStream) => {
          if (this.nearVideoElement.value && this.remoteVideoElement.value) {
            if (this.nearVideoElement.value) {
              this.nearVideoElement.value.srcObject = this.mediaStream.value!;
            }
            this.remoteVideoElement.value.srcObject = remoteStream;
            await Promise.all([
              this.waitForVideoReady(this.nearVideoElement.value),
              this.waitForVideoReady(this.remoteVideoElement.value),
            ]);
            this.elDialogVisible.value = true;
          } else {
            throw new Error(
              "Both video elements must be defined to answer the call"
            );
          }
        });

        call.on("close", this.releaseMediaStream);
      } catch (error) {
        console.error("Error answering call:", error);
        call.close();
        this.releaseMediaStream();
      }
    });
  };

  // Hypothetical function to show a UI prompt for call acceptance and media preferences
  showCallPrompt = async (call: MediaConnection) => {
    return new Promise<{
      accepted: boolean;
      video: boolean;
      audio: boolean;
    }>((resolve) => {
      // Implement your UI logic here to prompt the user for accepting the call and choosing media options
      // For example, display a modal with "Accept" and "Decline" buttons and checkboxes for video/audio
      // Once the user makes a choice, resolve the promise with an object like:
      // { accepted: boolean, video: boolean, audio: boolean }
      // Until implemented, assume a placeholder response for demonstration purposes:
      setTimeout(() => {
        resolve({ accepted: true, video: true, audio: true }); // Assume user accepts with video and audio
      }, 1000);
    });
  };
  // 释放媒体流资源
  releaseMediaStream = () => {
    if (this.mediaStream.value) {
      const tracks = this.mediaStream.value.getTracks();
      tracks.forEach((track) => track.stop());
      this.mediaStream.value = undefined;

      // 如果有必要，也可以在这里清除video元素的srcObject
      if (this.nearVideoElement.value) {
        this.nearVideoElement.value.srcObject = null;
      }
      if (this.remoteVideoElement.value) {
        this.remoteVideoElement.value.srcObject = null;
      }
    }
    this.elDialogVisible.value = false;
  };
  // 等待视频准备就绪
  waitForVideoReady = (videoElement: HTMLVideoElement) => {
    return new Promise<void>((resolve) => {
      videoElement.onloadedmetadata = () => {
        resolve();
      };
    });
  };
  getDevices = async (
    kind: "videoinput" | "audioinput"
  ): Promise<MediaDeviceInfo[]> => {
    return (await navigator.mediaDevices.enumerateDevices()).filter(
      (device) => device.kind === kind
    );
  };
  switchDevice = async (
    kind: "videoinput" | "audioinput",
    newDeviceId: string
  ) => {
    if (!this.mediaStream.value) {
      throw new Error("No active media stream to switch the device.");
    }

    const oldTracks = this.mediaStream.value
      .getTracks()
      .filter((track) => track.kind === kind);
    if (oldTracks.length === 0) {
      console.error(`No ${kind} track found in the current media stream.`);
      return;
    }

    const oldTrack = oldTracks[0];
    const constraints: MediaStreamConstraints = {
      video:
        kind === "videoinput" ? { deviceId: { exact: newDeviceId } } : true,
      audio:
        kind === "audioinput" ? { deviceId: { exact: newDeviceId } } : true,
    };

    try {
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      // 更新视频或音频元素的源对象
      if (kind === "videoinput") {
        if (this.nearVideoElement.value && this.remoteVideoElement.value) {
          this.nearVideoElement.value.srcObject = newStream;
          await this.waitForVideoReady(this.remoteVideoElement.value);
        } else {
          throw new Error(
            "Cannot answer the call without both video elements being defined"
          );
        }
      }

      // 停止并移除旧的轨道
      oldTrack.stop();
      this.mediaStream.value.removeTrack(oldTrack);

      // 将新的轨道添加到媒体流中
      newStream.getTracks().forEach((track) => {
        if (track.kind === kind) {
          this.mediaStream.value?.addTrack(track);
          // 如果是在通话中，这里可以根据实际情况决定如何更新远端设备
          // 在实际应用中，可能需要一个标志位或者回调函数来确认何时可以安全地替换远端轨道
        }
      });
    } catch (error) {
      console.error(`Error switching ${kind}:`, error);
      // 回退策略：恢复旧的轨道
      if (kind === "videoinput") {
        if (this.nearVideoElement.value && this.remoteVideoElement.value) {
          this.nearVideoElement.value.srcObject = this.mediaStream.value;
          await this.waitForVideoReady(this.remoteVideoElement.value);
        } else {
          throw new Error(
            "Cannot answer the call without both video elements being defined"
          );
        }
      }
      // 恢复旧轨道到媒体流（假定可以重新添加）
      this.mediaStream.value.addTrack(oldTrack);
    }
  };
  // 定义用于调用特定设备类型的快捷函数
  getCameras = async (): Promise<MediaDeviceInfo[]> => {
    return await this.getDevices("videoinput");
  };
  getMicrophones = async (): Promise<MediaDeviceInfo[]> => {
    return await this.getDevices("audioinput");
  };

  // 调用switchDevice时传入具体的设备类型
  switchCamera = async (newCameraId: string): Promise<void> => {
    return this.switchDevice("videoinput", newCameraId);
  };

  switchMicrophone = async (newMicrophoneId: string): Promise<void> => {
    return this.switchDevice("audioinput", newMicrophoneId);
  };
}
