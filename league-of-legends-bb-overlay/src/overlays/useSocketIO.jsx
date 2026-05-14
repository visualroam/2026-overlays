import { useEffect, useRef, useState, useCallback } from 'react';

export const useSocketIO = (url = 'ws://192.168.0.80:1349/socket.io', options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = options.maxReconnectAttempts || 10;
  const reconnectDelay = options.reconnectDelay || 1000;
  const isConnectingRef = useRef(false); // Use ref to avoid dependency issues

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.warn('Max reconnect attempts reached. Giving up.');
      setError(new Error('Max reconnect attempts reached'));
      return;
    }

    reconnectAttemptsRef.current += 1;
    console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}`);

    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Exponential backoff with jitter
    const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1), 10000);
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay + jitter);
  }, [maxReconnectAttempts, reconnectDelay]);

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (socketRef.current?.connected || isConnectingRef.current) {
      return;
    }

    isConnectingRef.current = true;
    setIsConnecting(true);
    setError(null);

    try {
      // Import socket.io-client dynamically to avoid SSR issues
      import('socket.io-client').then(({ io }) => {
        const socket = io(url, {
          transports: ['websocket', 'polling'], // Allow both transports, WebSocket first
          autoConnect: false,
          reconnection: false, // We'll handle reconnection manually
          timeout: 10000, // 10 second timeout
          forceNew: true, // Force new connection to avoid reuse issues
          upgrade: true, // Allow transport upgrade
          rememberUpgrade: false, // Don't remember upgrade to avoid issues
          ...options
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('Socket.IO connected');
          setIsConnected(true);
          setIsConnecting(false);
          isConnectingRef.current = false;
          reconnectAttemptsRef.current = 0;

          // Clear any existing reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        });

        socket.on('disconnect', (reason) => {
          console.log('Socket.IO disconnected:', reason);
          setIsConnected(false);
          setIsConnecting(false);
          isConnectingRef.current = false;

          if (reason === 'io server disconnect') {
            // Server disconnected us, don't reconnect
            return;
          }

          // Attempt to reconnect
          attemptReconnect();
        });

        socket.on('connect_error', (err) => {
          console.error('Socket.IO connection error:', err);
          setError(err);
          setIsConnecting(false);
          isConnectingRef.current = false;

          // Check if it's a CORS or transport error
          if (err.message && (err.message.includes('CORS') || err.message.includes('transport'))) {
            console.warn('CORS or transport error detected. This might be a server configuration issue.');
          }

          attemptReconnect();
        });

        socket.on('error', (err) => {
          console.error('Socket.IO error:', err);
          setError(err);
        });

        // Add transport error handling
        socket.on('transport_error', (err) => {
          console.error('Socket.IO transport error:', err);
          setError(err);
        });

        // Connect to the server
        socket.connect();
      }).catch((err) => {
        console.error('Failed to load socket.io-client:', err);
        setError(err);
        setIsConnecting(false);
        isConnectingRef.current = false;
        attemptReconnect();
      });
    } catch (err) {
      console.error('Error creating Socket.IO connection:', err);
      setError(err);
      setIsConnecting(false);
      isConnectingRef.current = false;
      attemptReconnect();
    }
  }, [url, options, attemptReconnect]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    isConnectingRef.current = false;
    setError(null);
    reconnectAttemptsRef.current = 0;
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket.IO is not connected');
    }
  }, []);

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
    socket: socketRef.current
  };
};
