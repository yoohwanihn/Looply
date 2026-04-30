import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFollowing, getFollowers, follow, unfollow } from '../../api/follows.js'
import styles from './FollowManagePage.module.css'

const myId = () => localStorage.getItem('userId')

function Avatar({ user }) {
  return (
    <div className={styles.avatar}>
      {user.profileImageUrl
        ? <img src={user.profileImageUrl} alt={user.name} />
        : <span>{user.name?.[0] ?? '?'}</span>}
    </div>
  )
}

function UserRow({ user, onToggleFollow }) {
  const navigate = useNavigate()
  const [following, setFollowing] = useState(user.isFollowing)
  const [loading, setLoading] = useState(false)

  // 부모에서 isFollowing이 변경되면 로컬 state도 동기화
  useEffect(() => {
    setFollowing(user.isFollowing)
  }, [user.isFollowing])

  const handleToggle = async (e) => {
    e.stopPropagation()
    setLoading(true)
    const prev = following
    try {
      if (prev) {
        await unfollow(user.id)
        setFollowing(false)
        onToggleFollow?.(user.id, false)
      } else {
        await follow(user.id)
        setFollowing(true)
        onToggleFollow?.(user.id, true)
      }
    } catch (_) {
      setFollowing(prev)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.row} onClick={() => navigate(`/profile/${user.id}`)}>
      <Avatar user={user} />
      <div className={styles.info}>
        <span className={styles.name}>{user.name}</span>
        {user.department && (
          <span className={styles.sub}>
            {user.department}{user.position ? ` · ${user.position}` : ''}
          </span>
        )}
      </div>
      {String(myId()) !== String(user.id) && (
        <button
          className={`${styles.btn} ${following ? styles.btnFollowing : styles.btnFollow}`}
          onClick={handleToggle}
          disabled={loading}
        >
          {following ? '팔로잉' : '팔로우'}
        </button>
      )}
    </div>
  )
}

export default function FollowManagePage() {
  const [tab, setTab] = useState('following')
  const [following, setFollowing] = useState([])
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [f1, f2] = await Promise.all([getFollowing(), getFollowers()])
      setFollowing(Array.isArray(f1) ? f1 : [])
      setFollowers(Array.isArray(f2) ? f2 : [])
    } catch (_) {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleToggle = (userId, nowFollowing) => {
    if (nowFollowing) {
      // 팔로우: following 목록에 없으면 맨 앞에 추가
      setFollowing(prev => {
        if (prev.find(u => u.id === userId)) {
          return prev.map(u => u.id === userId ? { ...u, isFollowing: true } : u)
        }
        const target = followers.find(u => u.id === userId)
        return target ? [{ ...target, isFollowing: true }, ...prev] : prev
      })
    } else {
      // 언팔로우: following 목록에서 제거
      setFollowing(prev => prev.filter(u => u.id !== userId))
    }
    // 팔로워 목록의 isFollowing 상태 업데이트
    setFollowers(prev =>
      prev.map(u => u.id === userId ? { ...u, isFollowing: nowFollowing } : u)
    )
  }

  const list = tab === 'following' ? following : followers

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>팔로잉 관리</h1>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'following' ? styles.tabActive : ''}`}
          onClick={() => setTab('following')}
        >
          팔로잉 <span className={styles.count}>{following.length}</span>
        </button>
        <button
          className={`${styles.tab} ${tab === 'followers' ? styles.tabActive : ''}`}
          onClick={() => setTab('followers')}
        >
          팔로워 <span className={styles.count}>{followers.length}</span>
        </button>
      </div>

      <div className={styles.body}>
        {loading && <p className={styles.msg}>불러오는 중...</p>}
        {!loading && list.length === 0 && (
          <p className={styles.msg}>
            {tab === 'following' ? '팔로우하는 사람이 없습니다.' : '팔로워가 없습니다.'}
          </p>
        )}
        {!loading && list.map(user => (
          <UserRow key={user.id} user={user} onToggleFollow={handleToggle} />
        ))}
      </div>
    </div>
  )
}
