import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/api";

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  autoConnect: true,
});

export default socket;
