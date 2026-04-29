import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPost, getComments, createComment } from '../../api/posts.js'
import Post from '../../components/Post/Post.jsx'
import Comment from '../../components/Comment/Comment.jsx'
import styles from './PostDetailPage.module.css'

export default function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [error, setError] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadPost() }, [id])
  useEffect(() => { if (post) loadComments() }, [post?.id])

  const loadPost = () =>
    getPost(id).then(r => setPost(r)).catch(() => setError(true))

  const loadComments = () =>
    getComments(id).then(r => setComments(r ?? [])).catch(() => {})

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      await createComment(id, commentText)
      setCommentText('')
      loadComments()
    } catch (_) {} finally { setSubmitting(false) }
  }

  if (error) return (
    <div className={styles.errorState}>
      <p>게시글을 찾을 수 없습니다.</p>
      <button onClick={() => navigate('/')}>홈으로 돌아가기</button>
    </div>
  )

  if (!post) return (
    <div className={styles.loadingState}>
      <div className={styles.spinner} />
    </div>
  )

  const myId = Number(localStorage.getItem('userId'))

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.title}>스레드</h1>
      </header>

      <Post post={post} onUpdate={loadPost} onDelete={() => navigate('/')} showComments />

      <section className={styles.commentSection}>
        <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
          <div className={styles.commentAvatar}>
            {String(myId)}
          </div>
          <div className={styles.commentInputWrap}>
            <input
              className={styles.commentInput}
              placeholder="답글 달기..."
              value={commentText}
              onChange={e => setCommentText(e.target.value.slice(0, 200))}
            />
            <button className={styles.commentBtn} disabled={!commentText.trim() || submitting}>
              게시
            </button>
          </div>
        </form>

        <div className={styles.commentList}>
          {comments.map(c => (
            <Comment key={c.id} comment={c} onDelete={loadComments} />
          ))}
          {comments.length === 0 && (
            <p className={styles.empty}>아직 답글이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  )
}
