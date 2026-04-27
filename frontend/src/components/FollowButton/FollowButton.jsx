import { useState } from 'react'
import { follow, unfollow } from '../../api/follows.js'
import styles from './FollowButton.module.css'

export default function FollowButton({ targetId, initialFollowing, onToggle }) {
  const [following, setFollowing] = useState(initialFollowing ?? false)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (loading) return
    const prev = following
    setFollowing(!prev)
    setLoading(true)
    try {
      if (prev) {
        await unfollow(targetId)
      } else {
        await follow(targetId)
      }
      if (onToggle) onToggle(!prev)
    } catch (_) {
      setFollowing(prev)
      alert(prev ? '언팔로우에 실패했습니다.' : '팔로우에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className={`${styles.btn} ${following ? styles.following : styles.notFollowing}`}
      onClick={toggle}
      disabled={loading}
      aria-label={following ? '언팔로우' : '팔로우'}
    >
      {following ? '팔로잉' : '팔로우'}
    </button>
  )
}
