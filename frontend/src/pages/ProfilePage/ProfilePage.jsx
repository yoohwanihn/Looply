import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProfile } from '../../api/users.js'
import FollowButton from '../../components/FollowButton/FollowButton.jsx'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(false)

  const handleFollowToggle = (nowFollowing) => {
    setProfile(prev => prev ? {
      ...prev,
      followerCount: prev.followerCount + (nowFollowing ? 1 : -1),
      isFollowing: nowFollowing,
    } : prev)
  }
  const myId = localStorage.getItem('userId')

  useEffect(() => {
    getProfile(id).then(res => setProfile(res)).catch(() => setError(true))
  }, [id])

  if (error) return <div className={styles.error}>프로필을 불러올 수 없습니다.</div>
  if (!profile) return <div className={styles.loading}>불러오는 중...</div>

  return (
    <div className={styles.container}>
      <div className={styles.backHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span style={{ fontSize: 17, fontWeight: 700 }}>{profile.name}</span>
      </div>

      <div className={styles.card}>
        <div className={styles.topRow}>
          <div>
            <h2 className={styles.name}>{profile.name}</h2>
            <p className={styles.dept}>{profile.department}{profile.position ? ` · ${profile.position}` : ''}</p>
          </div>
          <div className={styles.avatar}>
            {profile.profileImageUrl
              ? <img src={profile.profileImageUrl} alt={profile.name} />
              : <span>{profile.name?.[0] ?? '?'}</span>}
          </div>
        </div>

        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong>{profile.followerCount ?? 0}</strong>
            <span>팔로워</span>
          </div>
          <div className={styles.stat}>
            <strong>{profile.followingCount ?? 0}</strong>
            <span>팔로잉</span>
          </div>
          <div className={styles.stat}>
            <strong>{profile.postCount ?? 0}</strong>
            <span>게시글</span>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          {String(myId) === String(id)
            ? <button className={styles.editBtn} onClick={() => navigate('/profile/edit')}>프로필 수정</button>
            : <FollowButton targetId={Number(id)} initialFollowing={profile.isFollowing ?? false} onToggle={handleFollowToggle} />}
        </div>
      </div>
    </div>
  )
}
