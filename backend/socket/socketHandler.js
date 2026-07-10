import { Server } from 'socket.io';

let ioInstance = null;

/**
 * Initializes Socket.io server and configures connection handlers.
 * @param {object} server - HTTP Server instance.
 */
export const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`Socket Client Connected: ${socket.id}`);

    // Join order tracking room
    socket.on('join_order_room', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`Socket ${socket.id} joined tracking room: order_${orderId}`);
    });

    // Leave order tracking room
    socket.on('leave_order_room', (orderId) => {
      socket.leave(`order_${orderId}`);
      console.log(`Socket ${socket.id} left tracking room: order_${orderId}`);
    });

    // Join admin broadcast room
    socket.on('join_admin_room', () => {
      socket.join('admins');
      console.log(`Socket ${socket.id} joined admin monitor room.`);
    });

    // Leave admin broadcast room
    socket.on('leave_admin_room', () => {
      socket.leave('admins');
      console.log(`Socket ${socket.id} left admin monitor room.`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket Client Disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

/**
 * Sends a real-time event to a specific order tracking room.
 */
export const emitToOrderRoom = (orderId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`order_${orderId}`).emit(event, data);
  }
};

/**
 * Sends a real-time event to all active admin clients.
 */
export const emitToAdmins = (event, data) => {
  if (ioInstance) {
    ioInstance.to('admins').emit(event, data);
  }
};

/**
 * Returns the current Socket.io server instance.
 */
export const getIO = () => {
  return ioInstance;
};
