import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { likePost, unlikePost, deletePost, repost, undoRepost, updatePost } from '../../api/posts.js'
import { relativeTime } from '../../utils/time.js'
import ImageLightbox from '../ImageLightbox/ImageLightbox.jsx'
import PostContent from '../PostContent/PostContent.jsx'
import styles from './Post.module.css'

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

function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
  )
}

export default function Post({ post, onUpdate, onDelete, showComments }) {
  const navigate = useNavigate()
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0)
  const [liked, setLiked] = useState(post.likedByMe ?? false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [reposted, setReposted] = useState(post.repostedByMe ?? false)
  const [repostCount, setRepostCount] = useState(post.repostCount ?? 0)
  const [repostLoading, setRepostLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content ?? '')
  const [saving, setSaving] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const myId = Number(localStorage.getItem('userId'))
  const isOwner = post.userId === myId
  const hasThreadLine = showComments || (post.commentCount ?? 0) > 0

  const toggleLike = async (e) => {
    e.stopPropagation()
    if (likeLoading) return
    setLikeLoading(true)
    try {
      if (liked) {
        await unlikePost(post.id)
        setLikeCount(c => c - 1)
      } else {
        await likePost(post.id)
        setLikeCount(c => c + 1)
      }
      setLiked(v => !v)
    } catch (_) {} finally {
      setLikeLoading(false)
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!confirm('삭제하시겠습니까?')) return
    try {
      await deletePost(post.id)
      if (onDelete) onDelete()
      else if (onUpdate) onUpdate()
    } catch (_) { alert('게시글 삭제에 실패했습니다.') }
  }

  const handleEditSave = async (e) => {
    e.stopPropagation()
    if (!editContent.trim() || saving) return
    setSaving(true)
    try {
      await updatePost(post.id, editContent)
      setEditing(false)
      if (onUpdate) onUpdate()
    } catch (_) { alert('수정에 실패했습니다.') } finally { setSaving(false) }
  }

  const handleRepost = async (e) => {
    e.stopPropagation()
    if (repostLoading) return
    setRepostLoading(true)
    try {
      if (reposted) {
        await undoRepost(post.id)
        setRepostCount(c => c - 1)
      } else {
        await repost(post.id)
        setRepostCount(c => c + 1)
      }
      setReposted(v => !v)
      if (onUpdate) onUpdate()
    } catch (_) {} finally {
      setRepostLoading(false)
    }
  }

  return (
    <article className={styles.post} onClick={() => !showComments && navigate(`/posts/${post.id}`)}>
      <div className={styles.leftCol}>
        <Link to={`/profile/${post.userId}`} className={styles.avatar} onClick={e => e.stopPropagation()}>
          {post.profileImageUrl
            ? <img src={post.profileImageUrl} alt={post.userName} />
            : <span>{post.userName?.[0]?.toUpperCase() ?? '?'}</span>}
        </Link>
        {hasThreadLine && <div className={styles.threadLine} />}
      </div>

      <div className={styles.rightCol}>
        {post.originalPost && (
          <div className={styles.repostBadge}>리포스트</div>
        )}

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link to={`/profile/${post.userId}`} className={styles.name} onClick={e => e.stopPropagation()}>
              {post.userName}
            </Link>
            {post.department && <span className={styles.dept}>{post.department}</span>}
            <span className={styles.time}>{relativeTime(post.createdAt)}</span>
          </div>
          {isOwner && (
            <div className={styles.menuWrap} onClick={e => e.stopPropagation()}>
              <button className={styles.menuBtn} onClick={() => setMenuOpen(v => !v)}>
                <MoreIcon />
              </button>
              {menuOpen && (
                <div className={styles.menuDropdown}>
                  {!post.originalPost && (
                    <button className={styles.menuItem} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setEditing(true); setEditContent(post.content ?? '') }}>
                      수정
                    </button>
                  )}
                  <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={handleDelete}>
                    삭제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {post.originalPost ? (
          <div className={styles.originalCard}>
            <div className={styles.originalMeta}>
              <strong>{post.originalPost.userName}</strong>
              {post.originalPost.department && <span>{post.originalPost.department}</span>}
            </div>
            <p className={styles.originalContent}>{post.originalPost.content}</p>
          </div>
        ) : editing ? (
          <div className={styles.editForm} onClick={e => e.stopPropagation()}>
            <textarea
              className={styles.editTextarea}
              value={editContent}
              onChange={e => setEditContent(e.target.value.slice(0, 300))}
              rows={3}
              autoFocus
            />
            <div className={styles.editActions}>
              <button className={styles.editCancel} onClick={e => { e.stopPropagation(); setEditing(false) }}>취소</button>
              <button className={styles.editSave} onClick={handleEditSave} disabled={!editContent.trim() || saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <PostContent content={post.content} className={styles.content} />
            {post.isEdited && <span className={styles.edited}>수정됨</span>}
            {post.imageUrls?.length > 0 && (
              <div className={`${styles.images} ${post.imageUrls.length === 1 ? styles.imagesSingle : ''}`}>
                {post.imageUrls.map((url, i) => (
                  <img
                    key={url}
                    src={url}
                    alt={`이미지 ${i + 1}`}
                    className={styles.image}
                    onClick={e => { e.stopPropagation(); setLightboxIndex(i) }}
                  />
                ))}
              </div>
            )}
            {lightboxIndex !== null && (
              <ImageLightbox
                images={post.imageUrls}
                index={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
                onPrev={() => setLightboxIndex(i => i - 1)}
                onNext={() => setLightboxIndex(i => i + 1)}
              />
            )}
          </>
        )}

        <div className={styles.actions}>
          <button
            className={`${styles.action} ${liked ? styles.liked : ''}`}
            onClick={toggleLike}
            disabled={likeLoading}
            aria-label="좋아요"
          >
            <HeartIcon filled={liked} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <button className={styles.action} onClick={e => { e.stopPropagation(); navigate(`/posts/${post.id}`) }} aria-label="댓글">
            <CommentIcon />
            {(post.commentCount ?? 0) > 0 && <span>{post.commentCount}</span>}
          </button>
          {!post.originalPost && !isOwner && (
            <button
              className={`${styles.action} ${reposted ? styles.reposted : ''}`}
              onClick={handleRepost}
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
      </div>
    </article>
  )
}
