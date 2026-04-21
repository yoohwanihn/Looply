import { useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../../api/client.js'
import styles from './Post.module.css'

export default function Post({ post, onUpdate }) {
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0)
  const [liked, setLiked] = useState(post.likedByMe ?? false)

  const toggleLike = async () => {
    try {
      if (liked) {
        await client.delete(`/posts/${post.id}/likes`)
        setLikeCount((c) => c - 1)
      } else {
        await client.post(`/posts/${post.id}/likes`)
        setLikeCount((c) => c + 1)
      }
      setLiked(!liked)
    } catch (_) {}
  }

  const relativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return '방금 전'
    if (mins < 60) return `${mins}분 전`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}시간 전`
    return `${Math.floor(hours / 24)}일 전`
  }

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <Link to={`/profile/${post.userId}`} className={styles.avatar}>
          {post.profileImageUrl
            ? <img src={post.profileImageUrl} alt={post.userName} />
            : <span>{post.userName?.[0]}</span>}
        </Link>
        <div className={styles.meta}>
          <Link to={`/profile/${post.userId}`} className={styles.name}>
            {post.userName}
          </Link>
          <span className={styles.dept}>{post.department}</span>
          <span className={styles.time}>{relativeTime(post.createdAt)}</span>
        </div>
      </div>

      <p className={styles.content}>{post.content}</p>

      {post.updatedAt !== post.createdAt && (
        <span className={styles.edited}>수정됨</span>
      )}

      <div className={styles.actions}>
        <button
          className={`${styles.action} ${liked ? styles.liked : ''}`}
          onClick={toggleLike}
        >
          ♥ {likeCount}
        </button>
        <button className={styles.action}>💬 {post.commentCount ?? 0}</button>
        <button className={styles.action}>↩ {post.repostCount ?? 0}</button>
      </div>
    </article>
  )
}
