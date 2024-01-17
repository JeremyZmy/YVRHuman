const scene = spaceDocument.scene as BABYLON.Scene;

spatialDocument.addEventListener("spaceReady", function () {
  const animationGroups = scene.animationGroups.filter((ag) =>
    ag.name.startsWith("model.")
  );
  if (animationGroups.length >= 1) {
    animationGroups[3].start(true);

    setTimeout(() => {
      animationGroups[8].start(true);
    }, 1000);
  }
});

// 事件监听
spaceDocument.watchInputEvent();
spaceDocument.addEventListener("mouse", (event) => {
  const inputData = event["inputData"];
  if (inputData.Action === "move") {
  } else if (inputData.Action === "down") {
    console.log("jsar_test: 按下鼠标");
    sendMessageToAndroid(EventStatus.StopPlaying);
  } else if (inputData.Action === "up") {
  }
});

spaceDocument.addEventListener("handtracking", (event) => {
  const inputData = event["inputData"];
  if (inputData.Type === 1) {
    // right hand
    const joints = inputData.Joints;
    if (joints?.length > 8) {
    }
  }
});

const socket = new WebSocket("ws://localhost:8080");
let connectionAttempts = 0;

// 建立WebSocket连接
connectSocket(3);

/*
 * WebSocket 连接
 * reconnectCount: 最大重连次数
 */
function connectSocket(reconnectCount) {
  // 监听连接建立的事件
  socket.onopen = () => {
    console.log("WebSocket 连接已建立");
    // 发送消息
    sendMessageToAndroid(EventStatus.Ready);
    // 重置连接尝试次数
    connectionAttempts = 0;
  };

  // 监听收到消息的事件
  socket.onmessage = (event) => {
    console.log("jsar_test: 收到消息:", event.data);
    receivedStatus(event.data);
  };

  // 监听连接关闭的事件
  socket.onclose = (event) => {
    console.log("jsar_test: WebSocket 连接已关闭:", event.code, event.reason);

    // 判断是否达到最大重连次数
    if (connectionAttempts < reconnectCount) {
      // 连接断开后，延迟一段时间后进行重连
      setTimeout(() => {
        connectionAttempts++;
        console.log("jsar_test: 重连次数:", connectionAttempts);
        connectSocket(reconnectCount);
      }, 2000);
    } else {
      console.log("jsar_test: 达到最大重连次数，停止重连");
    }
  };

  // 监听连接发生错误的事件
  socket.onerror = (error) => {
    console.error("jsar_test: WebSocket 错误发生:", error);
  };
}

/**
 * JSAR 与 Android 端活动状态枚举
 */
const EventStatus = {
  /** 未知 */
  Unknown: 0,
  /** JSAR端 通知已准备好可监听用户录音 */
  Ready: 1,
  /**  录音中 */
  Recording: 2,
  /**  录音完毕 */
  Recorded: 3,
  /**  识别中 */
  Recognizing: 4,
  /**  播放中 */
  PlayingVoice: 5,
  /**  结束播放 */
  VoiceFinished: 6,
  /**  JSAR端 主动终止录音 */
  StopRecording: 7,
  /**  JSAR端 主动终止播放 */
  StopPlaying: 8,
};

/**
 * 监听到Android端消息通知
 */
function receivedStatus(value: any) {
  switch (parseInt(value)) {
    case EventStatus.Unknown:
      break;

    case EventStatus.Ready:
      break;

    case EventStatus.Recording:
      console.log("jsar_test: 已开始录音");
      break;

    case EventStatus.Recorded:
      break;

    case EventStatus.Recognizing:
      break;

    case EventStatus.PlayingVoice:
      break;

    case EventStatus.VoiceFinished:
      break;

    case EventStatus.StopRecording:
      break;

    case EventStatus.StopPlaying:
      break;

    default:
      console.log("jsar_test: 未知的枚举值");
      break;
  }
}

/**
 * 向Android端发消息
 */
function sendMessageToAndroid(status = EventStatus.Unknown) {
  socket.send(`${status}`);
}
