import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { likePost, unlikePost, deletePost, repost, undoRepost } from '../../api/posts.js'
import styles from './Post.module.css'

export default function Post({ post, onUpdate, showComments }) {
  const navigate = useNavigate()
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0)
  const [liked, setLiked] = useState(post.likedByMe ?? false)
  const [reposted, setReposted] = useState(post.repostedByMe ?? false)
  const [repostCount, setRepostCount] = useState(post.repostCount ?? 0)
  const myId = Number(localStorage.getItem('userId'))
  const isOwner = post.userId === myId

  const toggleLike = async (e) => {
    e.stopPropagation()
    try {
      if (liked) {
        await unlikePost(post.id)
        setLikeCount((c) => c - 1)
      } else {
        await likePost(post.id)
        setLikeCount((c) => c + 1)
      }
      setLiked(!liked)
    } catch (_) {}
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('삭제하시겠습니까?')) return
    try {
      await deletePost(post.id)
      if (onUpdate) onUpdate()
    } catch (_) {
      alert('게시글 삭제에 실패했습니다.')
    }
  }

  const handleRepost = async (e) => {
    e.stopPropagation()
    try {
      if (reposted) {
        await undoRepost(post.id)
        setRepostCount((c) => c - 1)
      } else {
        await repost(post.id)
        setRepostCount((c) => c + 1)
      }
      setReposted(!reposted)
      if (onUpdate) onUpdate()
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
    <article className={styles.card} onClick={() => navigate(`/posts/${post.id}`)}>
      {post.originalPost && (
        <div className={styles.repostBadge}>↩ 리포스트</div>
      )}
      <div className={styles.header}>
        <Link to={`/profile/${post.userId}`} className={styles.avatar}
              onClick={(e) => e.stopPropagation()}>
          {post.profileImageUrl
            ? <img src={post.profileImageUrl} alt={post.userName} />
            : <span>{post.userName?.[0] ?? '?'}</span>}
        </Link>
        <div className={styles.meta}>
          <Link to={`/profile/${post.userId}`} className={styles.name}
                onClick={(e) => e.stopPropagation()}>
            {post.userName}
          </Link>
          <span className={styles.dept}>{post.department}</span>
          <span className={styles.time}>{relativeTime(post.createdAt)}</span>
        </div>
        {isOwner && (
          <button className={styles.deleteBtn} onClick={handleDelete}>🗑</button>
        )}
      </div>

      {post.originalPost ? (
        <div className={styles.originalCard}>
          <div className={styles.originalMeta}>
            <strong>{post.originalPost.userName}</strong>
            <span>{post.originalPost.department}</span>
          </div>
          <p className={styles.originalContent}>{post.originalPost.content}</p>
        </div>
      ) : (
        <>
          <p className={styles.content}>{post.content}</p>
          {post.isEdited && <span className={styles.edited}>수정됨</span>}
          {post.imageUrls?.length > 0 && (
            <div className={styles.images}>
              {post.imageUrls.map((url, i) => (
                <img key={url} src={url} alt={`${post.userName}의 이미지 ${i + 1}`} className={styles.image}
                     onClick={(e) => e.stopPropagation()} />
              ))}
            </div>
          )}
        </>
      )}

      <div className={styles.actions}>
        <button
          className={`${styles.action} ${liked ? styles.liked : ''}`}
          onClick={toggleLike}
          aria-label="좋아요"
          aria-pressed={liked}
        >
          ♥ {likeCount}
        </button>
        <button className={styles.action}
                onClick={(e) => { e.stopPropagation(); navigate(`/posts/${post.id}`) }}>
          💬 {post.commentCount ?? 0}
        </button>
        {!post.originalPost && (
          <button className={`${styles.action} ${reposted ? styles.reposted : ''}`} onClick={handleRepost}>
            ↩ {repostCount}
          </button>
        )}
      </div>
    </article>
  )
}
