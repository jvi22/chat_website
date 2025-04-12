import React, { useState, useEffect } from 'react';
import { FiSend, FiUser, FiVideo, FiMoreVertical, FiSmile, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from './context/ThemeContext'; // Add this import
import Profile from './components/Profile/Profile'; // Add this import

const App = () => {
  const { theme, toggleTheme } = useTheme(); // Add this line
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hey there! 👋', sender: 'them', time: '10:30 AM' },
    { id: 2, text: 'Hi! Ready for our meeting?', sender: 'me', time: '10:31 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(['Alex', 'Jordan', 'Taylor']);

  // Add these theme classes to your main div
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

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        text: newMessage,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className={`flex h-screen ${themeClasses[theme]}`}>
      {/* Theme Toggle Button - Add this */}
      <button 
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-opacity-80 backdrop-blur-sm"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <FiMoon className="text-gray-700" /> : <FiSun className="text-yellow-300" />}
      </button>

      {/* Sidebar */}
      <div className={`w-80 border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h1 className="text-xl font-semibold">Chats</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {onlineUsers.map(user => (
            <div 
              key={user} 
              className={`p-3 flex items-center ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} cursor-pointer`}
              onClick={() => {/* Add profile click handler */}}
            >
              <Profile username={user} compact /> {/* Replace user bubble with Profile component */}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
          <div className="flex items-center">
            <Profile username="Group Chat" compact showParticipants />
          </div>
          <div className="flex space-x-4">
            <button className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <FiVideo className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
            </button>
            <button className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <FiMoreVertical className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className={`flex-1 p-4 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={`flex mb-4 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender === 'me' 
                    ? `${messageClasses[theme].me} rounded-br-none` 
                    : `${messageClasses[theme].them} rounded-bl-none ${theme === 'light' ? 'shadow' : ''}`
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'me' ? 'text-blue-100' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center">
            <button className={`p-2 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
              <FiSmile />
            </button>
            <input
              type="text"
              value={newMessage}
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
      </div>
    </div>
  );
};

export default App;