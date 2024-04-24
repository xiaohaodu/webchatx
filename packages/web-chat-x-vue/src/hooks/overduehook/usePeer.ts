import Peer, { DataConnection, MediaConnection } from "peerjs";
type UsePeerOptions = {
  nearVideoElement: Ref<HTMLVideoElement | undefined>;
  remoteVideoElement: Ref<HTMLVideoElement | undefined>;
  remotePeerId: Ref<string>; // 改为接收Ref类型
  host?: string;
  port?: number;
  path?: string;
};
export default function usePeer(options: UsePeerOptions) {
  const nearPeer = ref<Peer | undefined>(undefined);
  const nearPeerId = ref("");
  const remotePeerId = options.remotePeerId;
  const dataConnect = ref<DataConnection | undefined>(undefined);
  const mediaConnect = ref<MediaConnection | undefined>(undefined);
  const mediaStream = ref<MediaStream | undefined>();
  const nearVideoElement = options.nearVideoElement;
  const remoteVideoElement = options.remoteVideoElement;
  // 初始化PeerJS实例
  nearPeer.value = new Peer({
    host: options.host || "localhost",
    port: options.port || 3000,
    path: options.path || "/peer",
  });
  // 监听本地peer ID生成事件
  nearPeer.value?.on("open", async (id) => {
    nearPeerId.value = id;
    console.log(`Local peer ID: ${nearPeerId.value}`);
  });
  const cleanupResources = () => {
    if (mediaStream.value) {
      const tracks = mediaStream.value.getTracks();
      tracks.forEach((track) => track.stop());
      mediaStream.value = undefined;
    }

    nearPeer.value?.destroy();
  };
  // 建立连接并发送消息
  const connectAndSendMessage = () => {
    if (!remotePeerId.value) {
      throw new Error("No remote peer ID specified");
    }

    dataConnect.value = nearPeer.value?.connect(remotePeerId.value);
    if (dataConnect.value) {
      dataConnect.value.on("open", () => {
        dataConnect.value?.send("Hi!");
      });
    }
  };
  // 处理来自其他对端的连接请求
  const handleIncomingConnections = () => {
    nearPeer.value?.on("connection", (conn) => {
      conn.on("data", (data) => {
        console.log(`Received data: ${data}`);
      });
    });
  };
  // 开始视频通话
  const startCall = async () => {
    try {
      mediaStream.value = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (nearVideoElement.value) {
        nearVideoElement.value.srcObject = mediaStream.value;
        await waitForVideoReady(nearVideoElement.value);
      }

      mediaConnect.value = nearPeer.value?.call(
        remotePeerId.value,
        mediaStream.value
      );
      if (mediaConnect.value && remoteVideoElement.value) {
        mediaConnect.value.on("stream", async (remoteStream) => {
          if (nearVideoElement.value && remoteVideoElement.value) {
            remoteVideoElement.value.srcObject = remoteStream;
            await waitForVideoReady(remoteVideoElement.value);
          } else {
            throw new Error(
              "Cannot answer the call without both video elements being defined"
            );
          }
        });

        mediaConnect.value.on("close", releaseMediaStream);
      }
    } catch (error) {
      console.error("Error starting call:", error);
      releaseMediaStream();
    }
  };
  // 接收并应答视频通话
  const answerCall = () => {
    nearPeer.value?.on("call", async (call: MediaConnection) => {
      try {
        mediaStream.value = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (nearVideoElement.value) {
          nearVideoElement.value.srcObject = mediaStream.value;
          await waitForVideoReady(nearVideoElement.value);
        }

        call.answer(mediaStream.value);

        if (call && remoteVideoElement.value) {
          call.on("stream", async (remoteStream) => {
            if (nearVideoElement.value && remoteVideoElement.value) {
              remoteVideoElement.value.srcObject = remoteStream;
              await waitForVideoReady(remoteVideoElement.value);
            } else {
              throw new Error(
                "Cannot answer the call without both video elements being defined"
              );
            }
          });

          call.on("close", releaseMediaStream);
        }
      } catch (error) {
        console.error("Error answering call:", error);
        call.close();
        releaseMediaStream();
      }
    });
  };
  // 新增文本消息监听和发送
  const onTextMessage = (handler: (message: string) => void) => {
    if (dataConnect.value) {
      dataConnect.value.on("data", (data: any) => {
        if (typeof data === "string") {
          handler(data);
        }
      });
    }
  };
  const sendTextMessage = (message: string) => {
    if (dataConnect.value) {
      dataConnect.value.send(message);
    } else {
      throw new Error("No active data connection to send message");
    }
  };
  // 释放媒体流资源
  const releaseMediaStream = () => {
    if (mediaStream.value) {
      const tracks = mediaStream.value.getTracks();
      tracks.forEach((track) => track.stop());
      mediaStream.value = undefined;

      // 如果有必要，也可以在这里清除video元素的srcObject
      if (nearVideoElement.value) {
        nearVideoElement.value.srcObject = null;
      }
      if (remoteVideoElement.value) {
        remoteVideoElement.value.srcObject = null;
      }
    }
  };
  // 等待视频准备就绪
  const waitForVideoReady = (videoElement: HTMLVideoElement) =>
    new Promise<void>((resolve) => {
      videoElement.onloadedmetadata = () => {
        resolve();
      };
    });
  async function getDevices(
    kind: "videoinput" | "audioinput"
  ): Promise<MediaDeviceInfo[]> {
    return await navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => devices.filter((device) => device.kind === kind));
  }
  const switchDevice = async (
    kind: "videoinput" | "audioinput",
    newDeviceId: string
  ) => {
    if (!mediaStream.value) {
      throw new Error("No active media stream to switch the device.");
    }

    const oldTracks = mediaStream.value
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
        if (nearVideoElement.value && remoteVideoElement.value) {
          nearVideoElement.value.srcObject = newStream;
          await waitForVideoReady(remoteVideoElement.value);
        } else {
          throw new Error(
            "Cannot answer the call without both video elements being defined"
          );
        }
      }

      // 停止并移除旧的轨道
      oldTrack.stop();
      mediaStream.value.removeTrack(oldTrack);

      // 将新的轨道添加到媒体流中
      newStream.getTracks().forEach((track) => {
        if (track.kind === kind) {
          mediaStream.value?.addTrack(track);

          // 如果是在通话中，这里可以根据实际情况决定如何更新远端设备
          // 在实际应用中，可能需要一个标志位或者回调函数来确认何时可以安全地替换远端轨道
        }
      });
    } catch (error) {
      console.error(`Error switching ${kind}:`, error);

      // 回退策略：恢复旧的轨道
      if (kind === "videoinput") {
        if (nearVideoElement.value && remoteVideoElement.value) {
          nearVideoElement.value.srcObject = mediaStream.value;
          await waitForVideoReady(remoteVideoElement.value);
        } else {
          throw new Error(
            "Cannot answer the call without both video elements being defined"
          );
        }
      }
      // 恢复旧轨道到媒体流（假定可以重新添加）
      mediaStream.value.addTrack(oldTrack);
    }
  };
  // 定义用于调用特定设备类型的快捷函数
  async function getCameras(): Promise<MediaDeviceInfo[]> {
    return getDevices("videoinput");
  }
  async function getMicrophones(): Promise<MediaDeviceInfo[]> {
    return getDevices("audioinput");
  }

  // 调用switchDevice时传入具体的设备类型
  const switchCamera = async (newCameraId: string): Promise<void> =>
    switchDevice("videoinput", newCameraId);

  const switchMicrophone = async (newMicrophoneId: string): Promise<void> =>
    switchDevice("audioinput", newMicrophoneId);

  // 文件传输相关函数
  let fileReader: FileReader | null = null;
  const initFileReader = () => {
    if (!fileReader) {
      fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (dataConnect.value) {
          dataConnect.value.send(event.target?.result);
        }
      };
    }
  };
  const receiveFile = async (blob: Blob) => {
    initFileReader();
    fileReader!.readAsArrayBuffer(blob);
  };
  const sendFile = async (file: File) => {
    initFileReader();
    return new Promise<void>((resolve, reject) => {
      fileReader!.onerror = () => reject(new Error("Failed to read file"));
      fileReader!.readAsArrayBuffer(file);
      fileReader!.onloadend = () => {
        if (dataConnect.value) {
          dataConnect.value.send(fileReader!.result as ArrayBuffer);
          resolve();
        } else {
          reject(new Error("No active data connection to send file"));
        }
      };
    });
  };

  return {
    nearPeerId,
    remotePeerId,
    cleanupResources,
    connectAndSendMessage,
    handleIncomingConnections,
    startCall,
    answerCall,

    dataConnect,
    getCameras,
    getMicrophones,
    switchCamera,
    switchMicrophone,

    onTextMessage,
    sendTextMessage,

    receiveFile,
    sendFile,
  };
}
