import { Server } from 'socket.io';

let io: Server | null = null;

export function initSockets(server: any) {
  io = new Server(server, { cors: { origin: '*' } });
}

export function broadcastOrderStatus(orderId: number, status: string) {
  io?.emit('order_status', { orderId, status });
}


