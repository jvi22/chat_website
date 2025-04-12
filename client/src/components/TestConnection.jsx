import { useEffect } from 'react'
import axios from 'axios'

export default function TestConnection() {
  useEffect(() => {
    axios.get('/api/test')
      .then(res => console.log('Backend response:', res.data))
      .catch(err => console.error('Connection failed:', err))
  }, [])

  return <div>Testing backend connection...</div>
}