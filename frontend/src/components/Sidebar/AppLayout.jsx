import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Toast from '../Toast/Toast.jsx'
import { useToast } from '../../hooks/useToast.js'
import styles from './AppLayout.module.css'

const AppContext = createContext({
  hasNewTimeline: false,
  clearTimeline: () => {},
  unreadCount: 0,
  showToast: () => {},
})

export const useAppContext = () => useContext(AppContext)

export default function AppLayout({ children }) {
  const location = useLocation()
  const [hasNewTimeline, setHasNewTimeline] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const clientRef = useRef(null)
  const { toasts, showToast } = useToast()

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
            stompClient.subscribe('/user/queue/timeline', () => setHasNewTimeline(true))
            stompClient.subscribe('/user/queue/notifications', () => setUnreadCount(c => c + 1))
          },
          reconnectDelay: 5000,
        })
        stompClient.activate()
        clientRef.current = stompClient
      } catch (e) {
        console.error('[AppLayout] WebSocket connect', e)
      }
    }
    connect()
    return () => { cancelled = true; clientRef.current?.deactivate() }
  }, [])

  useEffect(() => {
    if (location.pathname === '/notifications') setUnreadCount(0)
  }, [location.pathname])

  const clearTimeline = () => setHasNewTimeline(false)

  return (
    <AppContext.Provider value={{ hasNewTimeline, clearTimeline, unreadCount, showToast }}>
      <div className={styles.layout}>
        <Sidebar unreadCount={unreadCount} />
        <main className={styles.main}>{children}</main>
      </div>
      <Toast toasts={toasts} />
    </AppContext.Provider>
  )
}
