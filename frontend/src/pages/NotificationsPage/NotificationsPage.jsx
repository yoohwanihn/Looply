import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, markAllRead } from '../../api/notifications.js'
import styles from './NotificationsPage.module.css'

const typeLabel = {
  LIKE: '님이 회원님의 게시글을 좋아합니다.',
  COMMENT: '님이 회원님의 게시글에 댓글을 남겼습니다.',
  FOLLOW: '님이 회원님을 팔로우하기 시작했습니다.',
}

const typeIcon = {
  LIKE: '❤️',
  COMMENT: '💬',
  FOLLOW: '👤',
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return '방금'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotifications()
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
    markAllRead().catch(() => {})
  }, [])

  const handleClick = (n) => {
    if (n.resourceType === 'POST' && n.resourceId) navigate(`/posts/${n.resourceId}`)
    else if (n.resourceType === 'USER' && n.senderId) navigate(`/profile/${n.senderId}`)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>알림</h1>
      </header>

      {loading && <div className={styles.msg}>불러오는 중...</div>}

      {!loading && notifications.length === 0 && (
        <div className={styles.empty}>
          <p>새로운 알림이 없습니다.</p>
        </div>
      )}

      <div className={styles.list}>
        {notifications.map(n => (
          <div
            key={n.id}
            className={`${styles.item} ${!n.read ? styles.unread : ''}`}
            onClick={() => handleClick(n)}
          >
            <div className={styles.iconWrap}>
              <div className={styles.avatar}>
                {n.senderProfileImageUrl
                  ? <img src={n.senderProfileImageUrl} alt={n.senderName} />
                  : <span>{n.senderName?.[0] ?? '?'}</span>}
              </div>
              <span className={styles.typeIcon}>{typeIcon[n.type] ?? '🔔'}</span>
            </div>
            <div className={styles.content}>
              <p className={styles.text}>
                <strong>{n.senderName}</strong>{typeLabel[n.type] ?? ''}
              </p>
              <span className={styles.time}>{timeAgo(n.createdAt)}</span>
            </div>
            {!n.read && <span className={styles.dot} />}
          </div>
        ))}
      </div>
    </div>
  )
}
