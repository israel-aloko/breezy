import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = () => {
    if (socket?.connected) return socket;

    socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', {
        withCredentials: true,
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => socket;