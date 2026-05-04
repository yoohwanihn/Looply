import { useState } from 'react'
import { follow, unfollow } from '../../api/follows.js'
import { useAppContext } from '../Sidebar/AppLayout.jsx'
import styles from './FollowButton.module.css'

export default function FollowButton({ targetId, initialFollowing, onToggle }) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const { showToast } = useAppContext()

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    const prev = following
    try {
      if (following) await unfollow(targetId)
      else await follow(targetId)
      setFollowing(v => !v)
      if (onToggle) onToggle(!prev)
    } catch (e) {
      console.error('[FollowButton]', e)
      showToast(prev ? '언팔로우에 실패했습니다.' : '팔로우에 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className={`${styles.btn} ${following ? styles.following : ''}`}
      onClick={handleClick}
      disabled={loading}
    >
      {following ? '팔로잉' : '팔로우'}
    </button>
  )
}
