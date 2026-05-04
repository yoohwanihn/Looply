import { useNavigate } from 'react-router-dom'
import styles from './PostActions.module.css'

function HeartIcon({ filled }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function RepostIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

export default function PostActions({
  post, liked, likeCount, likeLoading,
  reposted, repostCount, repostLoading,
  isOwner, onLike, onRepost,
}) {
  const navigate = useNavigate()

  return (
    <div className={styles.actions}>
      <button
        className={`${styles.action} ${liked ? styles.liked : ''}`}
        onClick={onLike}
        disabled={likeLoading}
        aria-label="좋아요"
      >
        <HeartIcon filled={liked} />
        {likeCount > 0 && <span>{likeCount}</span>}
      </button>
      <button
        className={styles.action}
        onClick={e => { e.stopPropagation(); navigate(`/posts/${post.id}`) }}
        aria-label="댓글"
      >
        <CommentIcon />
        {(post.commentCount ?? 0) > 0 && <span>{post.commentCount}</span>}
      </button>
      {!post.originalPost && !isOwner && (
        <button
          className={`${styles.action} ${reposted ? styles.reposted : ''}`}
          onClick={onRepost}
          disabled={repostLoading}
          aria-label="리포스트"
        >
          <RepostIcon />
          {repostCount > 0 && <span>{repostCount}</span>}
        </button>
      )}
      {!post.originalPost && isOwner && (
        <span className={`${styles.action} ${styles.actionDisabled}`}>
          <RepostIcon />
          {repostCount > 0 && <span>{repostCount}</span>}
        </span>
      )}
    </div>
  )
}
