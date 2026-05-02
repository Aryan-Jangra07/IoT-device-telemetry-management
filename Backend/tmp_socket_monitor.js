const { io } = require("socket.io-client");
const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Monitor connected to Socket.IO backend:", socket.id);
  // We can't know the exact deviceId unless we catch-all, but socket.io client can't naturally catch-all unless we use `socket.onAny()`
  socket.onAny((event, ...args) => {
    console.log(`[SOCKET_EVENT] ${event}`, args);
  });
});

setTimeout(() => {
  console.log("Shutting down monitor after 10s...");
  process.exit(0);
}, 10000);
