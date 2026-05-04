import { useState } from 'react'
import { Link } from 'react-router-dom'
import { relativeTime } from '../../utils/time.js'
import styles from './PostHeader.module.css'

function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}

export default function PostHeader({ post, isOwner, onEditClick, onDeleteClick }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleEdit = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    onEditClick()
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    onDeleteClick()
  }

  return (
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
                <button className={styles.menuItem} onClick={handleEdit}>수정</button>
              )}
              <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={handleDelete}>
                삭제
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
