import { useEffect, useRef } from 'react'

export function useWebSocket(onTimelineNew) {
  const clientRef = useRef(null)
  const callbackRef = useRef(onTimelineNew)

  useEffect(() => {
    callbackRef.current = onTimelineNew
  })

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    let cancelled = false

    const connect = async () => {
      try {
        const [{ Client }, { default: SockJS }] = await Promise.all([
          import('@stomp/stompjs'),
          import('sockjs-client'),
        ])
        if (cancelled) return

        const stompClient = new Client({
          webSocketFactory: () => new SockJS('/ws'),
          connectHeaders: { Authorization: `Bearer ${token}` },
          onConnect: () => {
            stompClient.subscribe('/user/queue/timeline', () => {
              callbackRef.current?.()
            })
          },
          reconnectDelay: 5000,
        })
        stompClient.activate()
        clientRef.current = stompClient
      } catch (_) {}
    }

    connect()

    return () => {
      cancelled = true
      clientRef.current?.deactivate()
    }
  }, [])
}
