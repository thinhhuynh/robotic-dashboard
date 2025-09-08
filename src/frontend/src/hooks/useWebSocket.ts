'use client'

import { useState, useEffect, useRef } from 'react'

interface UseWebSocketReturn {
  isConnected: boolean
  lastMessage: string | null
  sendMessage: (message: string) => void
  reconnect: () => void
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  const connect = () => {
    try {
      // TODO: Implement WebSocket connection logic
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected to:', url)
        setIsConnected(true)

        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
      }

      ws.current.onmessage = (event) => {
        // TODO: Handle incoming messages
        setLastMessage(event.data)
      }

      ws.current.onclose = (event) => {
        console.log('❌ WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)

        // TODO: Implement auto-reconnection logic
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...')
          connect()
        }, 3000)
      }

      ws.current.onerror = (error) => {
        console.error('🚨 WebSocket error:', error)
        setIsConnected(false)
      }

    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      setIsConnected(false)
    }
  }

  const sendMessage = (message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message)
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  const reconnect = () => {
    if (ws.current) {
      ws.current.close()
    }
    connect()
  }

  useEffect(() => {
    connect()

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [url])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect
  }
}