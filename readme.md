### 基于原生实现的WebSocket封装

1. 心跳检测
2. 重连机制
3. 心跳内容自定义

## 使用方式
```js 
var options = {
    onMessage: function(msg) {
        console.log("收到消息", msg);
    },
    onFailed: function() {
        console.log("连接失败");
    },
    onError: function() {
        console.log("出现错误");
    },
    autoReconnect: {
        retries: 5,
        delay: 3000,
        onFailed: function() {
            console.log("重连失败");
        }
    },
    heartBeat: {
        message: "ping",
        interval: 5000,
        timeout: 3000,
    }
}
var url = "ws://localhost:8080/ws";
useWebSocket(url, options)
```