/**
 * 1. 心跳检测
 * 2. 重连机制
 * 3. 心跳内容自定义
 * 4. 心跳间隔时间自定义
 * 5. 心跳超时处理
 *
 */

function resolveNestedOptions(options) {
    if (options === true) {
        return {}
    }
    return options
}

function useWebSocket(wsUrl, options) {

  var status = "connecting"; // 连接状态
  var ws = null; // WebSocket对象
  var retried = 0; // 重连次数
  
  var onMessage = options.onMessage; // 消息处理函数
  var onError = options.onError; // 错误处理函数
  var onConnected = options.onConnected; // 连接成功处理函数
  var onDisconnected = options.onDisconnected; // 断开连接处理函数
  var autoReconnect = options.autoReconnect || true; // 是否自动重连

  // heartbeat content
  var heartbeatInterval = 3000; // 心跳间隔时间，单位毫秒
  var heartbeatTimer = null; // 心跳定时器
  var timeout = 15000; // 心跳超时时间，单位毫秒
  var heartBeatMsg = "ping"; // 心跳内容
  var heartBeat = options.heartBeat;
  var pongtimer = null;
  if (heartBeat) {
      heartBeatMsg = heartBeat.message || heartBeatMsg
      heartbeatInterval = heartBeat.interval || heartbeatInterval
      timeout = heartBeat.timeout || timeout
  }

  _init()
  function _init() {
    ws = new WebSocket(wsUrl);
    explicitlyClosed = false;

    ws.onopen = function () {
    //   console.log("webSocket 已经连接");
      status = "open";
      if (onConnected) {
        onConnected();
      }
      startHeartbeat(); // 开始心跳
    };

    ws.onclose = function () {
    //   console.log("webSocket 已经关闭");
      status = "closed";
      ws = null;
      if (onDisconnected) {
        onDisconnected();
      }
      if (autoReconnect) {
          var resolveOptions = resolveNestedOptions(options.autoReconnect)
          var delay = resolveOptions.delay || 1000;
          var retries = resolveOptions.retries || 5;
          var onFailed = resolveOptions.onFailed;
          if (retries > 0 && (retried < retries)) {
              setTimeout(function(){
                  retried++;
                  _init();
              }, delay)
          }else {
            onFailed && onFailed();
          }
      }
    };

    ws.onmessage = function (event) {
    //   console.log("收到消息", event.data);
      clearTimeout(pongtimer)
      pongtimer = null
      if (onMessage) {
        onMessage(event.data);
      }
    };

    ws.onerror = function () {
      status = false;
      stopHeartbeat(); // 停止心跳
      onError && onError()
    //   console.log("webSocket 出现错误");
    };
  }

  function startHeartbeat() {
    heartbeatTimer = setInterval(() => {
        console.log(heartBeatMsg);
      ws.send(heartBeatMsg);
      if (pongtimer != null) return;
      pongtimer = setTimeout(() => {
        closeWebsocket();
      }, timeout)
    }, heartbeatInterval);
  }

  function stopHeartbeat() {
    clearInterval(heartbeatTimer);
  }

  function closeWebsocket() {
    ws.close();
  }

  function sendMsg(msg) {
    if (status !== 'open' || !ws) return;
    ws.send(msg);
  }
  return {
    status: status,
    sendMsg: sendMsg,
    closeWebsocket: closeWebsocket,
    ws: ws,

  }
}


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


