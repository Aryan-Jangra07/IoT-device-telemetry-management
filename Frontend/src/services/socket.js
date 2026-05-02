import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const connectSocket = (deviceId, onTelemetry) => {
  if (!socket.connected) {
    socket.connect();
  }

  const topic = `telemetry/${deviceId}`;
  socket.on(topic, onTelemetry);

  return () => {
    socket.off(topic, onTelemetry);
  };
};

export const subscribeStatus = (deviceId, onStatus) => {
  if (!socket.connected) {
    socket.connect();
  }

  const topic = `deviceStatus/${deviceId}`;
  socket.on(topic, onStatus);

  return () => {
    socket.off(topic, onStatus);
  };
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
