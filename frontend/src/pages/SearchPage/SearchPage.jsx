import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchUsers } from '../../api/users.js'
import FollowButton from '../../components/FollowButton/FollowButton.jsx'
import styles from './SearchPage.module.css'

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const myId = localStorage.getItem('userId')

  const handleSearch = useCallback(async (q) => {
    const trimmed = q.trim()
    if (!trimmed) { setResults([]); setSearched(false); return }
    setLoading(true)
    try {
      const data = await searchUsers(trimmed)
      setResults(Array.isArray(data) ? data : [])
      setSearched(true)
    } catch (_) {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const v = e.target.value
    setQuery(v)
    if (!v.trim()) { setResults([]); setSearched(false) }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch(query)
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}><SearchIcon /></span>
        <input
          className={styles.input}
          type="text"
          placeholder="사용자 이름 검색..."
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        {query && (
          <button className={styles.clear} onClick={() => { setQuery(''); setResults([]); setSearched(false) }}>✕</button>
        )}
      </div>

      {loading && <div className={styles.msg}>검색 중...</div>}

      {!loading && searched && results.length === 0 && (
        <div className={styles.msg}>검색 결과가 없습니다.</div>
      )}

      {!loading && !searched && (
        <div className={styles.hint}>이름으로 사용자를 검색하세요</div>
      )}

      <div className={styles.list}>
        {results.map(user => (
          <div key={user.id} className={styles.userCard}>
            <div className={styles.avatarWrap} onClick={() => navigate(`/profile/${user.id}`)}>
              <div className={styles.avatar}>
                {user.profileImageUrl
                  ? <img src={user.profileImageUrl} alt={user.name} />
                  : <span>{user.name?.[0] ?? '?'}</span>}
              </div>
            </div>
            <div className={styles.info} onClick={() => navigate(`/profile/${user.id}`)}>
              <strong className={styles.name}>{user.name}</strong>
              {user.department && <span className={styles.dept}>{user.department}{user.position ? ` · ${user.position}` : ''}</span>}
            </div>
            {String(myId) !== String(user.id) && (
              <FollowButton targetId={user.id} initialFollowing={false} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
