import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import client from '../../api/client.js'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    client.get(`/users/${id}`).then((res) => setProfile(res.data)).catch(() => {})
  }, [id])

  if (!profile) return <div className={styles.loading}>불러오는 중...</div>

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.avatar}>
          {profile.profileImageUrl
            ? <img src={profile.profileImageUrl} alt={profile.name} />
            : <span>{profile.name[0]}</span>}
        </div>
        <h2 className={styles.name}>{profile.name}</h2>
        <p className={styles.dept}>{profile.department} · {profile.position}</p>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong>{profile.postCount ?? 0}</strong>
            <span>게시글</span>
          </div>
          <div className={styles.stat}>
            <strong>{profile.followerCount ?? 0}</strong>
            <span>팔로워</span>
          </div>
          <div className={styles.stat}>
            <strong>{profile.followingCount ?? 0}</strong>
            <span>팔로잉</span>
          </div>
        </div>
      </div>
    </div>
  )
}
