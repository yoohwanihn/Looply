import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProfile, getUserPosts } from '../../api/users.js'
import FollowButton from '../../components/FollowButton/FollowButton.jsx'
import Post from '../../components/Post/Post.jsx'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(false)
  const [posts, setPosts] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef(null)
  const loadingMoreRef = useRef(false)
  const myId = localStorage.getItem('userId')

  const handleFollowToggle = (nowFollowing) => {
    setProfile(prev => prev ? {
      ...prev,
      followerCount: prev.followerCount + (nowFollowing ? 1 : -1),
      isFollowing: nowFollowing,
    } : prev)
  }

  useEffect(() => {
    getProfile(id).then(res => setProfile(res)).catch(() => setError(true))
  }, [id])

  useEffect(() => {
    setPosts([])
    setCursor(null)
    setHasMore(true)
    loadingMoreRef.current = false
    fetchPosts(null, true)
  }, [id])

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) fetchPosts(cursor, false)
    }, { threshold: 0.1 })
    if (loaderRef.current) obs.observe(loaderRef.current)
    return () => obs.disconnect()
  }, [cursor, hasMore])

  const fetchPosts = async (cur, reset) => {
    if (!reset && loadingMoreRef.current) return
    loadingMoreRef.current = true
    try {
      const data = await getUserPosts(id, cur)
      const newPosts = Array.isArray(data) ? data : (data?.data ?? [])
      setPosts(prev => reset ? newPosts : [...prev, ...newPosts])
      if (newPosts.length > 0) setCursor(newPosts[newPosts.length - 1].id)
      setHasMore(newPosts.length === 20)
    } catch (_) {
      setHasMore(false)
    } finally {
      loadingMoreRef.current = false
    }
  }

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

      <div className={styles.postsSection}>
        <div className={styles.postsSectionHeader}>게시글</div>
        <div className={styles.postsList}>
          {posts.map(post => (
            <Post key={post.id} post={post} onUpdate={() => fetchPosts(null, true)} />
          ))}
        </div>
        <div ref={loaderRef} className={styles.postsLoader}>
          {hasMore
            ? (posts.length > 0 ? '불러오는 중...' : '')
            : posts.length === 0
              ? '게시글이 없습니다.'
              : '모든 게시글을 확인했습니다.'}
        </div>
      </div>
    </div>
  )
}
