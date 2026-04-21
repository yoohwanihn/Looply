import { useEffect, useState, useRef } from 'react'
import client from '../../api/client.js'
import Post from '../../components/Post/Post.jsx'
import styles from './TimelinePage.module.css'

export default function TimelinePage() {
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hasNew, setHasNew] = useState(false)
  const textareaRef = useRef(null)
  const MAX_LENGTH = 300

  useEffect(() => {
    fetchTimeline()
  }, [])

  const fetchTimeline = async () => {
    try {
      const res = await client.get('/posts/timeline')
      setPosts(res.data ?? [])
      setHasNew(false)
    } catch (_) {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      await client.post('/posts', { content })
      setContent('')
      fetchTimeline()
    } catch (_) {} finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.logo}>NT SNS</h2>
      </header>

      <main className={styles.main}>
        <form className={styles.compose} onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder="지금 무슨 생각을 하고 계신가요?"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
            rows={3}
          />
          <div className={styles.composeFooter}>
            <span className={`${styles.charCount} ${content.length >= MAX_LENGTH ? styles.limit : ''}`}>
              {content.length} / {MAX_LENGTH}
            </span>
            <button className={styles.postButton} disabled={!content.trim() || submitting}>
              게시하기
            </button>
          </div>
        </form>

        {hasNew && (
          <button className={styles.newBanner} onClick={fetchTimeline}>
            새 게시물 보기
          </button>
        )}

        <div className={styles.feed}>
          {posts.map((post) => (
            <Post key={post.id} post={post} onUpdate={fetchTimeline} />
          ))}
          {posts.length === 0 && (
            <p className={styles.empty}>팔로우한 사용자의 게시물이 여기에 표시됩니다.</p>
          )}
        </div>
      </main>
    </div>
  )
}
