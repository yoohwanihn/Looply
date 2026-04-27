import styles from './Comment.module.css'
import { deleteComment } from '../../api/posts.js'

export default function Comment({ comment, onDelete }) {
  const myId = Number(localStorage.getItem('userId'))

  const handleDelete = async () => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    try {
      await deleteComment(comment.id)
      if (onDelete) onDelete()
    } catch (_) {
      alert('댓글 삭제에 실패했습니다.')
    }
  }

  const relativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return '방금 전'
    if (mins < 60) return `${mins}분 전`
    return `${Math.floor(mins / 60)}시간 전`
  }

  return (
    <div className={styles.comment}>
      <div className={styles.avatar}>
        {comment.profileImageUrl
          ? <img src={comment.profileImageUrl} alt={comment.userName} />
          : <span>{comment.userName?.[0] ?? '?'}</span>}
      </div>
      <div className={styles.body}>
        <div className={styles.header}>
          <strong>{comment.userName}</strong>
          <span className={styles.time}>{relativeTime(comment.createdAt)}</span>
          {comment.userId === myId && (
            <button className={styles.deleteBtn} onClick={handleDelete}>삭제</button>
          )}
        </div>
        <p className={styles.content}>{comment.content}</p>
      </div>
    </div>
  )
}
