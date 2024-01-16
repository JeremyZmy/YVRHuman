const scene = spaceDocument.scene as BABYLON.Scene;

spatialDocument.addEventListener('spaceReady', function () {
  const animationGroups = scene.animationGroups
    .filter((ag) => ag.name.startsWith('model.'));
  if (animationGroups.length >= 1) {
    animationGroups[3].start(true);

    setTimeout(() => {animationGroups[8].start(true)}, 1000);
  }
});

// 事件监听
spaceDocument.watchInputEvent();
spaceDocument.addEventListener("mouse", (event) => {
  const inputData = event["inputData"];
  if (inputData.Action === "move") {
  } else if (inputData.Action === "down") {
    socket.send("你好，我是客户端！");
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

// 创建 WebSocket 更换域名端口号可与Android端实现通讯： ws://172.18.1.12:8080
const socket = new WebSocket("ws://localhost:8080");
let connectionAttempts = 0;
// 初始连接, 最大重连次数 ，重连机制
connect(3);

function connect(reconnectCount) {
  // 监听连接建立的事件
  socket.onopen = () => {
    console.log("WebSocket 连接已建立");
    // 发送消息
    socket.send("你好，我是客户端！");
    // 重置连接尝试次数
    connectionAttempts = 0;
  };

  // 监听收到消息的事件
  socket.onmessage = (event) => {
    console.log("jsar_test: 收到消息:", event.data);
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
        connect(reconnectCount);
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
