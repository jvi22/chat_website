import { io } from 'socket.io-client'

// Initialize Socket.IO connection
const socket = io('http://localhost:3000', {
  autoConnect: false, // Prevent automatic connection
  withCredentials: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

// Connection lifecycle events
socket.on('connect', () => {
  console.log('Connected to Socket.IO server')
})

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason)
})

socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message)
})

export default socket