import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from './ThemeContext';

const Profile = ({ username }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`/api/users/${username}`);
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  const handleThemeToggle = async () => {
    toggleTheme();
    try {
      await axios.put(`/api/users/${username}`, {
        themePreference: theme === 'light' ? 'dark' : 'light'
      });
    } catch (err) {
      console.error('Failed to update theme preference:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img 
          src={user.profile.avatar || '/default-avatar.png'} 
          alt={user.username}
          className="profile-avatar"
        />
        <h2>{user.username}</h2>
        <button onClick={handleThemeToggle}>
          Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>
      <div className="profile-details">
        <p>{user.profile.bio || 'No bio yet'}</p>
        <p>Status: {user.online ? 'Online' : `Last seen ${new Date(user.lastSeen).toLocaleString()}`}</p>
      </div>
    </div>
  );
};

export default Profile;