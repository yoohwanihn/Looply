import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProfile, updateProfile, uploadAvatar } from '../../api/users.js'
import styles from './ProfileEditPage.module.css'

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMyProfile().then((res) => setBio(res?.bio ?? '')).catch(() => {})
  }, [])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (avatarFile) await uploadAvatar(avatarFile)
      await updateProfile({ bio })
      navigate(-1)
    } catch (_) {
      alert('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.backHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className={styles.headerTitle}>프로필 수정</span>
        <button className={styles.saveBtn} type="submit" form="profile-edit-form" disabled={saving}>
          {saving ? '저장 중...' : '저장'}
        </button>
      </header>

      <form id="profile-edit-form" className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.avatarSection}>
          <label className={styles.avatarLabel}>
            {preview
              ? <img src={preview} alt="미리보기" className={styles.avatarImg} />
              : <span className={styles.avatarPlaceholder}>사진 변경</span>}
            <span className={styles.avatarOverlay}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </span>
            <input type="file" accept="image/*" hidden onChange={handleFileChange} />
          </label>
        </div>

        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>소개</span>
          <textarea
            className={styles.textarea}
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 200))}
            rows={4}
            placeholder="자신을 소개해 주세요"
          />
        </div>
        <div className={styles.count}>{bio.length} / 200</div>
      </form>
    </div>
  )
}
