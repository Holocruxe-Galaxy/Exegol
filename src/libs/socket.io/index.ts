import { Manager, Socket } from "socket.io-client";
import { fetchData } from "src/store/apps/shipments";

let socket: Socket

export const connectToServer = (dispatch: any) => {
  const manager = new Manager('https://serenno-production.up.railway.app/socket.io/socket.io.js');

  socket?.removeAllListeners();
  socket = manager.socket('/');

  socket.on('exception', (res) => res.map((e: string) => e));
  socket.on('broadcast', () => dispatch(fetchData()));
}