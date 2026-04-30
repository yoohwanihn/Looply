import { useEffect, useRef, useState } from 'react'
import { getFollowingTimeline } from '../../api/posts.js'
import Post from '../../components/Post/Post.jsx'
import styles from './FollowingPage.module.css'

export default function FollowingPage() {
  const [posts, setPosts] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const loaderRef = useRef(null)
  const loadingRef = useRef(false)

  useEffect(() => { fetchPosts(null, true) }, [])

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) fetchPosts(cursor, false)
    }, { threshold: 0.1 })
    if (loaderRef.current) obs.observe(loaderRef.current)
    return () => obs.disconnect()
  }, [cursor, hasMore])

  const fetchPosts = async (cur, reset) => {
    if (!reset && loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const res = await getFollowingTimeline(cur)
      const newPosts = Array.isArray(res) ? res : (res?.data ?? [])
      setPosts(prev => reset ? newPosts : [...prev, ...newPosts])
      if (newPosts.length > 0) setCursor(newPosts[newPosts.length - 1].id)
      setHasMore(newPosts.length === 20)
    } catch (_) {} finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>팔로잉</h1>
      </header>

      <div className={styles.feed}>
        {posts.length === 0 && !loading && (
          <div className={styles.empty}>
            <p>팔로우한 사람의 게시글이 없습니다.</p>
            <span>검색에서 새로운 사람을 팔로우해보세요.</span>
          </div>
        )}
        {posts.map(post => (
          <Post key={post.id} post={post} onUpdate={() => fetchPosts(null, true)} />
        ))}
        <div ref={loaderRef} className={styles.loader}>
          {loading ? '불러오는 중...' : posts.length > 0 && !hasMore ? '모든 게시물을 확인했습니다.' : ''}
        </div>
      </div>
    </div>
  )
}
