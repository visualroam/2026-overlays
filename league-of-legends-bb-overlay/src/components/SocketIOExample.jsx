import React, { useEffect, useState } from 'react';
import { useSocketIO } from '../overlays/useSocketIO';

const SocketIOExample = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const {
    isConnected,
    isConnecting,
    error,
    emit,
    on,
    off
  } = useSocketIO('ws://192.168.0.80:1349/socket.io', {
    maxReconnectAttempts: 5,
    reconnectDelay: 2000
  });

  useEffect(() => {
    // Listen for incoming messages
    const handleMessage = (data) => {
      setMessages(prev => [...prev, { type: 'received', data, timestamp: new Date() }]);
    };

    // Listen for server events
    const handleServerEvent = (data) => {
      setMessages(prev => [...prev, { type: 'server-event', data, timestamp: new Date() }]);
    };

    on('message', handleMessage);
    on('server-event', handleServerEvent);

    // Cleanup listeners on unmount
    return () => {
      off('message', handleMessage);
      off('server-event', handleServerEvent);
    };
  }, [on, off]);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      emit('message', { text: inputMessage, timestamp: Date.now() });
      setMessages(prev => [...prev, { type: 'sent', data: { text: inputMessage }, timestamp: new Date() }]);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Socket.IO Connection Example</h2>

      {/* Connection Status */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          padding: '10px',
          borderRadius: '5px',
          backgroundColor: isConnected ? '#d4edda' : isConnecting ? '#fff3cd' : '#f8d7da',
          color: isConnected ? '#155724' : isConnecting ? '#856404' : '#721c24',
          border: `1px solid ${isConnected ? '#c3e6cb' : isConnecting ? '#ffeaa7' : '#f5c6cb'}`
        }}>
          Status: {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
          {error && <div style={{ marginTop: '5px', fontSize: '0.9em' }}>Error: {error.message}</div>}
        </div>
      </div>

      {/* Message Input */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected || !inputMessage.trim()}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: isConnected ? '#007bff' : '#6c757d',
              color: 'white',
              cursor: isConnected ? 'pointer' : 'not-allowed'
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        border: '1px solid #ccc',
        borderRadius: '4px',
        height: '300px',
        overflowY: 'auto',
        padding: '10px',
        backgroundColor: '#f8f9fa'
      }}>
        {messages.length === 0 ? (
          <div style={{ color: '#6c757d', textAlign: 'center', marginTop: '50px' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              style={{
                marginBottom: '10px',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: msg.type === 'sent' ? '#007bff' : msg.type === 'received' ? '#28a745' : '#ffc107',
                color: 'white',
                maxWidth: '80%',
                marginLeft: msg.type === 'sent' ? 'auto' : '0'
              }}
            >
              <div style={{ fontSize: '0.8em', marginBottom: '4px' }}>
                {msg.type === 'sent' ? 'You' : msg.type === 'received' ? 'Server' : 'Server Event'}
              </div>
              <div>{JSON.stringify(msg.data)}</div>
              <div style={{ fontSize: '0.7em', marginTop: '4px', opacity: 0.8 }}>
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Connection Controls */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid #007bff',
            backgroundColor: 'white',
            color: '#007bff',
            cursor: 'pointer'
          }}
        >
          Reconnect
        </button>
      </div>
    </div>
  );
};

export default SocketIOExample;
