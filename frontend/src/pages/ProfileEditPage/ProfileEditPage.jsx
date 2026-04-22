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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
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
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← 뒤로</button>
        <h2>프로필 수정</h2>
      </header>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.avatarSection}>
          <label className={styles.avatarLabel}>
            {preview
              ? <img src={preview} alt="미리보기" className={styles.avatarImg} />
              : <span className={styles.avatarPlaceholder}>사진 변경</span>}
            <input type="file" accept="image/*" hidden onChange={handleFileChange} />
          </label>
        </div>
        <label className={styles.label}>
          소개
          <textarea
            className={styles.textarea}
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 200))}
            rows={4}
            placeholder="자신을 소개해 주세요"
          />
          <span className={styles.count}>{bio.length} / 200</span>
        </label>
        <button className={styles.saveBtn} disabled={saving}>
          {saving ? '저장 중...' : '저장'}
        </button>
      </form>
    </div>
  )
}
