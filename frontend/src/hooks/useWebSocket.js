import { useEffect, useRef } from 'react'

export function useWebSocket(onTimelineNew) {
  const clientRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    import('@stomp/stompjs').then(({ Client }) => {
      import('sockjs-client').then(({ default: SockJS }) => {
        const stompClient = new Client({
          webSocketFactory: () => new SockJS('/ws'),
          connectHeaders: { Authorization: `Bearer ${token}` },
          onConnect: () => {
            stompClient.subscribe('/user/queue/timeline', () => {
              if (onTimelineNew) onTimelineNew()
            })
          },
          reconnectDelay: 5000,
        })
        stompClient.activate()
        clientRef.current = stompClient
      })
    })

    return () => {
      if (clientRef.current) clientRef.current.deactivate()
    }
  }, [])
}
