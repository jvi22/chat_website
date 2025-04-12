import React, { useState } from 'react';
import axios from 'axios';

const CreateRoom = ({ onRoomCreated }) => {
  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/chatrooms', {
        name,
        isPrivate
      });
      onRoomCreated(response.data);
      setName('');
      setIsPrivate(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room');
    }
  };

  return (
    <div className="create-room">
      <h3>Create New Chat Room</h3>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Room name"
          required
        />
        <label>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          Private Room
        </label>
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateRoom;