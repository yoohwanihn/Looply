import { useEffect, useRef, useState } from 'react'
import { createPost, getTimeline } from '../../api/posts.js'
import Post from '../../components/Post/Post.jsx'
import styles from './TimelinePage.module.css'
import { useWebSocket } from '../../hooks/useWebSocket.js'

export default function TimelinePage() {
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [hasNew, setHasNew] = useState(false)
  const loaderRef = useRef(null)
  const loadingMoreRef = useRef(false)
  const MAX_LENGTH = 300

  useWebSocket(() => setHasNew(true))

  useEffect(() => { fetchTimeline(null, true) }, [])

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !submitting) {
        fetchTimeline(cursor, false)
      }
    }, { threshold: 0.1 })
    if (loaderRef.current) obs.observe(loaderRef.current)
    return () => obs.disconnect()
  }, [cursor, hasMore, submitting])

  const fetchTimeline = async (cur, reset) => {
    if (!reset && loadingMoreRef.current) return
    loadingMoreRef.current = true
    try {
      const newPosts = await getTimeline(cur) ?? []
      setPosts((prev) => reset ? newPosts : [...prev, ...newPosts])
      if (reset) setHasNew(false)
      if (newPosts.length > 0) setCursor(newPosts[newPosts.length - 1].id)
      setHasMore(newPosts.length === 20)
    } catch (_) {} finally {
      loadingMoreRef.current = false
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4)
    setImages(files)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      await createPost(content, images)
      setContent('')
      setImages([])
      fetchTimeline(null, true)
    } catch (_) {} finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.logo}>Looply</h2>
      </header>
      <main className={styles.main}>
        <form className={styles.compose} onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            placeholder="지금 무슨 생각을 하고 계신가요?"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
            rows={3}
          />
          <div className={styles.composeFooter}>
            <label className={styles.imageLabel}>
              🖼 이미지
              <input type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
            </label>
            {images.length > 0 && (
              <span className={styles.imageCount}>{images.length}장 선택됨</span>
            )}
            <span className={`${styles.charCount} ${content.length >= MAX_LENGTH ? styles.limit : ''}`}>
              {content.length} / {MAX_LENGTH}
            </span>
            <button className={styles.postButton} disabled={!content.trim() || submitting}>
              게시하기
            </button>
          </div>
        </form>

        {hasNew && (
          <button className={styles.newBanner} onClick={() => { fetchTimeline(null, true); setHasNew(false) }}>
            새 게시물 보기
          </button>
        )}

        <div className={styles.feed}>
          {posts.map((post) => (
            <Post key={post.id} post={post} onUpdate={() => fetchTimeline(null, true)} />
          ))}
          <div ref={loaderRef} className={styles.loader}>
            {hasMore ? '불러오는 중...' : '모든 게시물을 확인했습니다.'}
          </div>
        </div>
      </main>
    </div>
  )
}
