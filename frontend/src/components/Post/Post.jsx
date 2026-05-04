import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { likePost, unlikePost, deletePost, repost, undoRepost, updatePost } from '../../api/posts.js'
import { useAppContext } from '../Sidebar/AppLayout.jsx'
import PostHeader from './PostHeader.jsx'
import PostActions from './PostActions.jsx'
import PostEditForm from './PostEditForm.jsx'
import PostContent from '../PostContent/PostContent.jsx'
import ImageLightbox from '../ImageLightbox/ImageLightbox.jsx'
import styles from './Post.module.css'

export default function Post({ post, onUpdate, onDelete, showComments }) {
  const navigate = useNavigate()
  const { showToast } = useAppContext()
  const [liked, setLiked] = useState(post.likedByMe ?? false)
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0)
  const [likeLoading, setLikeLoading] = useState(false)
  const [reposted, setReposted] = useState(post.repostedByMe ?? false)
  const [repostCount, setRepostCount] = useState(post.repostCount ?? 0)
  const [repostLoading, setRepostLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content ?? '')
  const [saving, setSaving] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const myId = Number(localStorage.getItem('userId'))
  const isOwner = post.userId === myId
  const hasThreadLine = showComments || (post.commentCount ?? 0) > 0

  const toggleLike = async (e) => {
    e.stopPropagation()
    if (likeLoading) return
    setLikeLoading(true)
    try {
      if (liked) { await unlikePost(post.id); setLikeCount(c => c - 1) }
      else { await likePost(post.id); setLikeCount(c => c + 1) }
      setLiked(v => !v)
    } catch (e) {
      console.error('[Post] toggleLike', e)
      showToast('좋아요 처리에 실패했습니다.', 'error')
    } finally { setLikeLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('삭제하시겠습니까?')) return
    try {
      await deletePost(post.id)
      if (onDelete) onDelete()
      else if (onUpdate) onUpdate()
    } catch (e) {
      console.error('[Post] delete', e)
      showToast('게시글 삭제에 실패했습니다.', 'error')
    }
  }

  const handleEditSave = async (content) => {
    if (!content.trim() || saving) return
    setSaving(true)
    try {
      await updatePost(post.id, content)
      setEditing(false)
      setEditContent(content)
      if (onUpdate) onUpdate()
    } catch (e) {
      console.error('[Post] editSave', e)
      showToast('수정에 실패했습니다.', 'error')
    } finally { setSaving(false) }
  }

  const handleRepost = async (e) => {
    e.stopPropagation()
    if (repostLoading) return
    setRepostLoading(true)
    try {
      if (reposted) { await undoRepost(post.id); setRepostCount(c => c - 1) }
      else { await repost(post.id); setRepostCount(c => c + 1) }
      setReposted(v => !v)
      if (onUpdate) onUpdate()
    } catch (e) {
      console.error('[Post] repost', e)
      showToast('리포스트에 실패했습니다.', 'error')
    } finally { setRepostLoading(false) }
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
        {post.originalPost && <div className={styles.repostBadge}>리포스트</div>}

        <PostHeader
          post={post}
          isOwner={isOwner}
          onEditClick={() => { setEditing(true); setEditContent(post.content ?? '') }}
          onDeleteClick={handleDelete}
        />

        {post.originalPost ? (
          <div className={styles.originalCard}>
            <div className={styles.originalMeta}>
              <strong>{post.originalPost.userName}</strong>
              {post.originalPost.department && <span>{post.originalPost.department}</span>}
            </div>
            <p className={styles.originalContent}>{post.originalPost.content}</p>
          </div>
        ) : editing ? (
          <PostEditForm
            content={editContent}
            onChange={setEditContent}
            onSave={handleEditSave}
            onCancel={() => setEditing(false)}
            saving={saving}
          />
        ) : (
          <>
            <PostContent content={post.content} className={styles.content} />
            {post.isEdited && <span className={styles.edited}>수정됨</span>}
            {post.imageUrls?.length > 0 && (
              <div className={`${styles.images} ${post.imageUrls.length === 1 ? styles.imagesSingle : ''}`}>
                {post.imageUrls.map((url, i) => (
                  <img key={url} src={url} alt={`이미지 ${i + 1}`} className={styles.image}
                    onClick={e => { e.stopPropagation(); setLightboxIndex(i) }} />
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

        <PostActions
          post={post}
          liked={liked}
          likeCount={likeCount}
          likeLoading={likeLoading}
          reposted={reposted}
          repostCount={repostCount}
          repostLoading={repostLoading}
          isOwner={isOwner}
          onLike={toggleLike}
          onRepost={handleRepost}
          onComment={() => { if (!showComments) navigate(`/posts/${post.id}`) }}
        />
      </div>
    </article>
  )
}
