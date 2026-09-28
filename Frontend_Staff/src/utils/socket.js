import { io } from "socket.io-client";
import { getSocketUrl, getSocketOptions } from "./urlHelper";

export const SOCKET_URL = getSocketUrl();

// Module-level persistent singleton socket client for Staff Portal
export const staffSocket = io(getSocketUrl(), getSocketOptions());

export default staffSocket;
