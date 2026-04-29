import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProfile, updateProfile } from '../../api/users.js'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getMyProfile().then(res => {
      setProfile(res)
      setBio(res?.bio ?? '')
    }).catch(() => {})
  }, [])

  const handleSaveBio = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await updateProfile({ bio })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (_) {
      alert('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userId')
    navigate('/login')
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>설정</h1>
      </header>

      <div className={styles.body}>
        {/* 계정 정보 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>계정 정보</h2>
          <div className={styles.card}>
            <InfoRow label="이름" value={profile?.name ?? '-'} />
            <InfoRow label="이메일" value={profile?.email ?? '-'} />
            <InfoRow label="사번" value={profile?.employeeNo ?? '-'} />
            <InfoRow label="부서" value={profile?.department ?? '-'} last />
          </div>
        </section>

        {/* 프로필 소개 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>프로필</h2>
          <div className={styles.card}>
            <div className={styles.fieldRow}>
              <label className={styles.label}>소개</label>
              <textarea
                className={styles.textarea}
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 200))}
                rows={3}
                placeholder="자신을 소개해 주세요"
              />
            </div>
            <div className={styles.bioFooter}>
              <span className={styles.count}>{bio.length}/200</span>
              <button className={styles.saveBtn} disabled={saving} onClick={handleSaveBio}>
                {saved ? '저장됨 ✓' : saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
          <button className={styles.linkBtn} onClick={() => navigate('/profile/edit')}>
            프로필 사진 변경 →
          </button>
        </section>

        {/* 계정 관리 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>계정 관리</h2>
          <div className={styles.card}>
            <button className={styles.dangerRow} onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function InfoRow({ label, value, last }) {
  return (
    <div className={`${styles.infoRow} ${last ? styles.last : ''}`}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  )
}
