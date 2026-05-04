import { useCallback, useEffect, useRef, useState } from 'react'

const PAGE_SIZE = 20

export function useInfiniteScroll(fetchFn, deps = []) {
  const fetchFnRef = useRef(fetchFn)
  useEffect(() => { fetchFnRef.current = fetchFn })

  const [items, setItems] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const cursorRef = useRef(null)
  const loadingRef = useRef(false)
  const loaderRef = useRef(null)
  const generationRef = useRef(0)

  const load = useCallback(async (isReset) => {
    if (!isReset && loadingRef.current) return
    const gen = generationRef.current
    loadingRef.current = true
    try {
      const cursor = isReset ? null : cursorRef.current
      const arr = await fetchFnRef.current(cursor)
      if (gen !== generationRef.current) return
      const list = Array.isArray(arr) ? arr : []
      setItems(prev => isReset ? list : [...prev, ...list])
      if (list.length > 0) cursorRef.current = list[list.length - 1].id
      setHasMore(list.length === PAGE_SIZE)
    } catch (e) {
      if (gen !== generationRef.current) return
      console.error('[useInfiniteScroll]', e)
      if (isReset) setHasMore(false)
    } finally {
      if (gen === generationRef.current) loadingRef.current = false
    }
  }, [])

  // deps 변경 시 처음부터 다시 로드
  useEffect(() => {
    generationRef.current++
    cursorRef.current = null
    setItems([])
    setHasMore(true)
    loadingRef.current = false
    load(true)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) load(false)
    }, { threshold: 0.1 })
    if (loaderRef.current) obs.observe(loaderRef.current)
    return () => obs.disconnect()
  }, [hasMore, load])

  const reset = useCallback(() => {
    generationRef.current++
    cursorRef.current = null
    setItems([])
    setHasMore(true)
    loadingRef.current = false
    load(true)
  }, [load])

  return { items, hasMore, loaderRef, reset }
}
