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
    getPost(id).then((r) => setPost(r)).catch(() => setError(true))

  const loadComments = () =>
    getComments(id).then((r) => setComments(r ?? [])).catch(() => {})

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      await createComment(id, commentText)
      setCommentText('')
      loadComments()
    } catch (_) {} finally {
      setSubmitting(false)
    }
  }

  if (error) return <div className={styles.loading}>게시글을 불러올 수 없습니다.</div>
  if (!post) return <div className={styles.loading}>불러오는 중...</div>

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← 뒤로</button>
        <h2>게시글</h2>
      </header>
      <Post post={post} onUpdate={loadPost} showComments />
      <section className={styles.commentSection}>
        <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
          <input
            className={styles.commentInput}
            placeholder="댓글 입력..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value.slice(0, 200))}
          />
          <button className={styles.commentBtn} disabled={!commentText.trim() || submitting}>
            등록
          </button>
        </form>
        <div className={styles.commentList}>
          {comments.map((c) => (
            <Comment key={c.id} comment={c} onDelete={loadComments} />
          ))}
          {comments.length === 0 && (
            <p className={styles.empty}>첫 댓글을 남겨보세요.</p>
          )}
        </div>
      </section>
    </div>
  )
}
