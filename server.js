const WebSocket = require("ws");

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({
  // host: "172.18.1.12",
  port: 8080,
});

// 监听连接建立的事件
wss.on("connection", (ws) => {
  console.log("新的 WebSocket 连接已建立");

  // 监听收到消息的事件
  ws.on("message", (message) => {
    console.log("收到消息:%s", message);

    // Listening
    if (message == 1) {
      console.log("JSAR端已准备好，请开始监听用户录音");
      // 发送消息到客户端);
      ws.send(2);
    }
    if (message == 8) {
      console.log("JSAR端通知结束播放语音");
    } else {
      // 发送消息到客户端
      ws.send("来喽，我是服务端！");
    }
  });

  // 监听连接关闭的事件
  ws.on("close", () => {
    console.log("WebSocket 连接已关闭");
  });

  // 监听连接发生错误的事件
  ws.on("error", (error) => {
    console.error("WebSocket 错误发生:", error);
  });
});
