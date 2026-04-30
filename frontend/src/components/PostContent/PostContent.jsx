import { useNavigate } from 'react-router-dom'
import { searchUsers } from '../../api/users.js'
import styles from './PostContent.module.css'

const MENTION_RE = /@([\w가-힣]+)/g

export default function PostContent({ content, className }) {
  const navigate = useNavigate()

  const handleMentionClick = async (e, name) => {
    e.stopPropagation()
    try {
      const users = await searchUsers(name)
      const match = Array.isArray(users) ? users.find(u => u.name === name) : null
      if (match) navigate(`/profile/${match.id}`)
    } catch (_) {}
  }

  if (!content) return null

  const parts = []
  let lastIndex = 0
  let m

  MENTION_RE.lastIndex = 0
  while ((m = MENTION_RE.exec(content)) !== null) {
    if (m.index > lastIndex) {
      parts.push(content.slice(lastIndex, m.index))
    }
    const name = m[1]
    parts.push(
      <span
        key={m.index}
        className={styles.mention}
        onClick={(e) => handleMentionClick(e, name)}
      >
        @{name}
      </span>
    )
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  return <p className={className}>{parts}</p>
}
