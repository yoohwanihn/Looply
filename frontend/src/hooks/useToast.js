import { useCallback, useEffect, useRef, useState } from 'react'

let idSeq = 0

export function useToast() {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef([])

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  const showToast = useCallback((message, type = 'info') => {
    const id = ++idSeq
    const duration = type === 'error' ? 5000 : 3000
    setToasts(prev => [...prev, { id, message, type }])
    const timerId = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
      timersRef.current = timersRef.current.filter(t => t !== timerId)
    }, duration)
    timersRef.current.push(timerId)
  }, [])

  return { toasts, showToast }
}
