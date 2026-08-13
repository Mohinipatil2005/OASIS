import { Server } from 'socket.io';

let ioInstance = null;

/**
 * Initializes Socket.io server and configures connection handlers.
 * @param {object} server - HTTP Server instance.
 */
export const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          process.env.FRONTEND_URL,
          process.env.CLIENT_URL,
          'https://pizza-hut-app.vercel.app'
        ].filter(Boolean);
        
        const cleanedOrigins = allowedOrigins.map(o => o.endsWith('/') ? o.slice(0, -1) : o);
        const cleanedOrigin = origin && origin.endsWith('/') ? origin.slice(0, -1) : origin;

        if (!origin || cleanedOrigins.includes(cleanedOrigin) || cleanedOrigin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
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
