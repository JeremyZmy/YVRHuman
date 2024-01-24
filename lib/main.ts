const scene = spatialDocument.scene as BABYLON.Scene;

let animationGroups;

spatialDocument.addEventListener("spaceReady", function () {
  animationGroups = scene.animationGroups.filter((ag) =>
    ag.name.startsWith("model.")
  );
  if (animationGroups.length >= 1) {

    // 0idle 1挠痒 6打招呼 8打哈欠 10讲话
    animationGroups[0].start(true);

  }
});

function stopAllAnimation() {
  animationGroups.forEach(element => {
    element.stop();
  });
}

// 事件监听
spatialDocument.watchInputEvent();
spatialDocument.addEventListener("mouse", (event) => {
  const inputData = event["inputData"];
  if (inputData.Action === "move") {
  } else if (inputData.Action === "down") {
    console.log("jsar_test: 按下鼠标");
    sendMessageToAndroid(EventStatus.StopPlaying);
  } else if (inputData.Action === "up") {
  }
});

spatialDocument.addEventListener("handtracking", (event) => {
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
  /** JSAR端 Socket已连接 */
  Ready: 1,
  /**  录音中 */
  Recording: 2,
  /**  录音完毕 */
  Recorded: 3,
  /** 热词监听中 */
  HotWordListen: 4,
  /** 热词监听结束 */
  HotWordListenEnd: 5,
  /**  AI回复播放中 */
  PlayingVoice: 6,
  /**  AI回复播放完毕 */
  VoiceFinished: 7,
  /**  JSAR端 主动终止录音 */
  StopRecording: 8,
  /**  JSAR端 主动终止播放 */
  StopPlaying: 9,
  /** 听写无网络 */
  VoiceInputNoNetwork: 10,
  /** 录音失败或没有打开麦克风 */
  RecordNotEnabled: 11,
  /** 语音输入内容为空 */
  VoiceInputEmpty: 12,
  /** AI模型网络不可用 */
  AiUnavailable: 13,
};

let isRecording = 0;

/**
 * 监听到Android端消息通知
 */
function receivedStatus(data: any) {
  var response = JSON.parse(data);
  switch (parseInt(response.content)) {
    case EventStatus.Unknown:
      break;

    case EventStatus.Ready:
      console.log("jsar_test: Ready");
      break;

    case EventStatus.Recording:
      stopAllAnimation();
      isRecording = 1;
      animationGroups[1].start(true);
      console.log("jsar_test: Recording");
      break;

    case EventStatus.Recorded:
      isRecording = 0;
      stopAllAnimation();
      animationGroups[0].start(true);
      console.log("jsar_test: Recorded");
      break;

    case EventStatus.HotWordListen:
      console.log("jsar_test: HotWordListen");

      break;

    case EventStatus.PlayingVoice:
      stopAllAnimation();
      animationGroups[10].start(true);
      console.log("jsar_test: PlayingVoice");

      break;

    case EventStatus.VoiceFinished:
      stopAllAnimation();
      if(isRecording) {
        animationGroups[1].start(true);
      }
      else
      {
        animationGroups[0].start(true);
      }

      console.log("jsar_test: VoiceFinished");

      break;

    case EventStatus.StopRecording:
      console.log("jsar_test: StopRecording");

      break;

    case EventStatus.StopPlaying:
      console.log("jsar_test: StopPlaying");

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
  var data = {
    messageId: "0",
    type: "req",
    content: `${status}`,
  };
  socket.send(JSON.stringify(data));
}
