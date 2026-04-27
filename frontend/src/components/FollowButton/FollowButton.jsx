import { useState } from 'react'
import { follow, unfollow } from '../../api/follows.js'
import styles from './FollowButton.module.css'

export default function FollowButton({ targetId, initialFollowing, onToggle }) {
  const [following, setFollowing] = useState(initialFollowing ?? false)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (following) {
        await unfollow(targetId)
      } else {
        await follow(targetId)
      }
      setFollowing(!following)
      if (onToggle) onToggle(!following)
    } catch (_) {} finally {
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
