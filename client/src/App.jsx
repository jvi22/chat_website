import React, { useState, useEffect } from 'react';
import { FiSend, FiUser, FiVideo, FiMoreVertical, FiSmile, FiMoon, FiSun } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { useTheme } from './context/ThemeContext';// Added for prop validation

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
  // Theme with fallback values
  const { theme = 'light', toggleTheme = () => {} } = useTheme() || {};

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

  // Theme classes with fallbacks
  const themeClasses = {
    light: 'bg-white text-gray-800',
    dark: 'bg-gray-900 text-gray-100'
  };

  const messageClasses = {
    light: {
      me: 'bg-blue-500 text-white',
      them: 'bg-white text-gray-800 shadow'
    },
    dark: {
      me: 'bg-blue-600 text-white',
      them: 'bg-gray-800 text-gray-100'
    }
  };

  const safeThemeClasses = themeClasses[theme] || themeClasses.light;
  const safeMessageClasses = messageClasses[theme] || messageClasses.light;

  const handleSend = () => {
    if (!isMounted) return;
    
    const trimmedMessage = newMessage?.trim();
    if (!trimmedMessage) return;

    try {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(), // Better ID generation
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
    <div className={`flex h-screen ${safeThemeClasses}`}>
      {/* Theme Toggle Button with error boundary */}
      <button 
        onClick={() => {
          try {
            toggleTheme();
          } catch (error) {
            console.error('Theme toggle failed:', error);
          }
        }}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-opacity-80 backdrop-blur-sm"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <FiMoon className="text-gray-700" />
        ) : (
          <FiSun className="text-yellow-300" />
        )}
      </button>

      {/* Sidebar with null checks */}
      <div className={`w-80 border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h1 className="text-xl font-semibold">Chats</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {Array.isArray(onlineUsers) && onlineUsers.map(user => (
            <div 
              key={user || 'unknown'} 
              className={`p-3 flex items-center ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} cursor-pointer`}
            >
              <SafeProfile username={user} compact />
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
          <div className="flex items-center">
            <SafeProfile username="Group Chat" compact showParticipants />
          </div>
          <div className="flex space-x-4">
            <VideoButton theme={theme} />
            <MoreOptionsButton theme={theme} />
          </div>
        </div>

        {/* Messages with null checks */}
        <MessageArea 
          messages={messages} 
          theme={theme} 
          messageClasses={safeMessageClasses}
        />

        {/* Input with validation */}
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSend={handleSend}
          theme={theme}
        />
      </div>
    </div>
  );
};

// Extracted components for better error isolation
const VideoButton = ({ theme }) => (
  <button className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
    <FiVideo className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
  </button>
);

const MoreOptionsButton = ({ theme }) => (
  <button className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
    <FiMoreVertical className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
  </button>
);

const MessageArea = ({ messages, theme, messageClasses }) => (
  <div className={`flex-1 p-4 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
    {Array.isArray(messages) && messages.map(msg => (
      <MessageBubble 
        key={msg.id} 
        msg={msg} 
        theme={theme} 
        messageClasses={messageClasses}
      />
    ))}
  </div>
);

const MessageBubble = ({ msg, theme, messageClasses }) => (
  <div className={`flex mb-4 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
      msg.sender === 'me' 
        ? `${messageClasses.me} rounded-br-none` 
        : `${messageClasses.them} rounded-bl-none ${theme === 'light' ? 'shadow' : ''}`
    }`}>
      <p>{msg.text || ''}</p>
      <p className={`text-xs mt-1 ${
        msg.sender === 'me' ? 'text-blue-100' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {msg.time || ''}
      </p>
    </div>
  </div>
);

const MessageInput = ({ newMessage, setNewMessage, handleSend, theme }) => (
  <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
    <div className="flex items-center">
      <button className={`p-2 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
        <FiSmile />
      </button>
      <input
        type="text"
        value={newMessage || ''}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type a message..."
        className={`flex-1 px-4 py-2 rounded-full border ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-600' 
            : 'border-gray-300 focus:ring-blue-500'
        } focus:outline-none focus:ring-2 focus:border-transparent`}
      />
      <button
        onClick={handleSend}
        className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
      >
        <FiSend />
      </button>
    </div>
  </div>
);

App.propTypes = {
  // Add any props validation if needed
};

export default App;