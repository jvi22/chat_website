import React, { useState, useEffect } from 'react';
import { FiSend, FiUser, FiVideo, FiMoreVertical, FiSmile } from 'react-icons/fi';
import PropTypes from 'prop-types';

// Safe component imports with fallbacks
const SafeProfile = ({ username, compact }) => {
  try {
    const Profile = require('./components/Profile/Profile').default;
    return <Profile username={username} compact={compact} />;
  } catch (error) {
    console.error('Profile component failed to load:', error);
    return (
      <div className="flex items-center p-3">
        <FiUser className="mr-3" />
        <span>{username || 'Unknown User'}</span>
      </div>
    );
  }
};

SafeProfile.propTypes = {
  username: PropTypes.string.isRequired,
  compact: PropTypes.bool
};

const App = () => {
  // State with validation
  const [messages, setMessages] = useState(() => {
    const defaultMessages = [
      { id: 1, text: 'Hey there! 👋', sender: 'them', time: '10:30 AM' },
      { id: 2, text: 'Hi! Ready for our meeting?', sender: 'me', time: '10:31 AM' }
    ];
    try {
      // Could load from localStorage here
      return defaultMessages;
    } catch (error) {
      console.error('Failed to load messages:', error);
      return defaultMessages;
    }
  });

  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(['Alex', 'Jordan', 'Taylor']);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleSend = () => {
    if (!isMounted) return;
    
    const trimmedMessage = newMessage?.trim();
    if (!trimmedMessage) return;

    try {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: trimmedMessage,
          sender: 'me',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!isMounted) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-white text-gray-800">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold">Chats</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {Array.isArray(onlineUsers) && onlineUsers.map(user => (
            <div 
              key={user || 'unknown'} 
              className="p-3 flex items-center hover:bg-gray-50 cursor-pointer"
            >
              <SafeProfile username={user} compact />
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <SafeProfile username="Group Chat" compact showParticipants />
          </div>
          <div className="flex space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <FiVideo className="text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <FiMoreVertical className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {Array.isArray(messages) && messages.map(msg => (
            <div 
              key={msg.id} 
              className={`flex mb-4 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender === 'me' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 rounded-bl-none shadow'
                }`}
              >
                <p>{msg.text || ''}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {msg.time || ''}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <FiSmile />
            </button>
            <input
              type="text"
              value={newMessage || ''}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
            >
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;