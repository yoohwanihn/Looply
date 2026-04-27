import { useEffect, useRef, useState } from 'react'
import { searchUsers } from '../../api/users.js'
import styles from './MentionInput.module.css'

export default function MentionInput({ value, onChange, placeholder, maxLength, rows }) {
  const [suggestions, setSuggestions] = useState([])
  const [mentionQuery, setMentionQuery] = useState(null)
  const textareaRef = useRef(null)

  const handleChange = (e) => {
    const text = e.target.value.slice(0, maxLength ?? 300)
    onChange(text)

    const cursor = e.target.selectionStart
    const before = text.slice(0, cursor)
    const match = before.match(/@([\w가-힣]*)$/)
    if (match) {
      setMentionQuery(match[1])
    } else {
      setMentionQuery(null)
      setSuggestions([])
    }
  }

  useEffect(() => {
    if (mentionQuery === null || mentionQuery.length < 1) {
      setSuggestions([])
      return
    }
    let cancelled = false
    const timer = setTimeout(() => {
      searchUsers(mentionQuery)
        .then((res) => { if (!cancelled) setSuggestions(res.data ?? []) })
        .catch(() => { if (!cancelled) setSuggestions([]) })
    }, 200)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [mentionQuery])

  const selectSuggestion = (user) => {
    const cursor = textareaRef.current.selectionStart
    const before = value.slice(0, cursor)
    const after = value.slice(cursor)
    const replaced = before.replace(/@[\w가-힣]*$/, `@${user.name} `)
    onChange(replaced + after)
    setSuggestions([])
    setMentionQuery(null)
    textareaRef.current.focus()
  }

  return (
    <div className={styles.wrapper}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows ?? 3}
        aria-label={placeholder}
      />
      {suggestions.length > 0 && (
        <ul className={styles.dropdown} role="listbox">
          {suggestions.map((u) => (
            <li key={u.id} className={styles.item} onMouseDown={() => selectSuggestion(u)} role="option">
              <strong>{u.name}</strong>
              <span>{u.department}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
