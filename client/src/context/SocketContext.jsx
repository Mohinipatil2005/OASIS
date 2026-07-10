import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [liveNotifications, setLiveNotifications] = useState([]);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Connect socket if user logged in
    if (user) {
      socket.connect();
      console.log('Socket connecting for user:', user.name);

      // If user is Admin, join administrative real-time feed
      if (user.role === 'admin') {
        socket.emit('join_admin_room');

        // Listen for new orders
        socket.on('new_order', (data) => {
          toast.success(`🍕 New Order Received from ${data.userName}! Amount: ₹${data.totalAmount}`, {
            duration: 8000,
            icon: '🔔'
          });
          // Play a gentle alert sound if needed
        });

        // Listen for low stock warnings
        socket.on('new_notification', (notification) => {
          if (notification.type === 'inventory') {
            toast.error(`⚠️ INVENTORY WARN: ${notification.message}`, {
              duration: 10000
            });
          }
          setLiveNotifications(prev => [notification, ...prev]);
        });
      }
    } else {
      // Disconnect socket if logged out
      socket.disconnect();
      setLiveNotifications([]);
    }

    return () => {
      socket.off('new_order');
      socket.off('new_notification');
    };
  }, [socket, user]);

  const joinOrderTracking = (orderId, callback) => {
    if (!socket) return;
    socket.emit('join_order_room', orderId);
    socket.on('order_status_updated', callback);
  };

  const leaveOrderTracking = (orderId) => {
    if (!socket) return;
    socket.emit('leave_order_room', orderId);
    socket.off('order_status_updated');
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        liveNotifications,
        setLiveNotifications,
        joinOrderTracking,
        leaveOrderTracking
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
