// frontend/src/pages/TimelinePage/TimelinePage.jsx
import { useState } from 'react'
import { createPost, getAllPosts } from '../../api/posts.js'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll.js'
import Post from '../../components/Post/Post.jsx'
import MentionInput from '../../components/MentionInput/MentionInput.jsx'
import { useAppContext } from '../../components/Sidebar/AppLayout.jsx'
import styles from './TimelinePage.module.css'

const MAX_LENGTH = 300

export default function TimelinePage() {
  const { hasNewTimeline, clearTimeline, showToast } = useAppContext()
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const fetchFn = async (cursor) => {
    const res = await getAllPosts(cursor)
    return Array.isArray(res) ? res : (res?.data ?? [])
  }

  const { items: posts, hasMore, loaderRef, reset } = useInfiniteScroll(fetchFn, [])

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files).slice(0, 4))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      await createPost(content, images)
      setContent('')
      setImages([])
      clearTimeline()
      reset()
    } catch (e) {
      console.error('[TimelinePage] createPost', e)
      showToast('게시글 등록에 실패했습니다.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <form className={styles.compose} onSubmit={handleSubmit}>
          <div className={styles.composeAvatar}>나</div>
          <div className={styles.composeRight}>
            <MentionInput
              value={content}
              onChange={setContent}
              placeholder="새로운 스레드 작성하기..."
              maxLength={300}
              rows={3}
            />
            <div className={styles.composeFooter}>
              <label className={styles.imageLabel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                {images.length > 0 && <span className={styles.imageCount}>{images.length}장</span>}
                <input type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
              </label>
              <span className={`${styles.charCount} ${content.length >= MAX_LENGTH ? styles.limit : ''}`}>
                {content.length}/{MAX_LENGTH}
              </span>
              <button className={styles.postButton} disabled={!content.trim() || submitting}>
                게시
              </button>
            </div>
          </div>
        </form>

        {hasNewTimeline && (
          <button className={styles.newBanner} onClick={() => { clearTimeline(); reset() }}>
            새 게시물 보기
          </button>
        )}

        <div className={styles.feed}>
          {posts.map(post => (
            <Post key={post.id} post={post} onUpdate={reset} />
          ))}
          <div ref={loaderRef} className={styles.loader}>
            {hasMore
              ? (posts.length > 0 ? '불러오는 중...' : '')
              : '모든 게시물을 확인했습니다.'}
          </div>
        </div>
      </main>
    </div>
  )
}
