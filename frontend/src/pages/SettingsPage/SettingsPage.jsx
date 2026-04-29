import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SettingsPage.module.css'

const NOTIF_KEY = 'looply_notif_prefs'

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY)) ?? {} } catch { return {} }
}
function savePrefs(prefs) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs))
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.toggleKnob} />
    </button>
  )
}

function SettingRow({ label, desc, right, last }) {
  return (
    <div className={`${styles.row} ${last ? styles.last : ''}`}>
      <div className={styles.rowText}>
        <span className={styles.rowLabel}>{label}</span>
        {desc && <span className={styles.rowDesc}>{desc}</span>}
      </div>
      <div className={styles.rowRight}>{right}</div>
    </div>
  )
}

function ActionRow({ label, desc, onClick, danger, last }) {
  return (
    <button
      className={`${styles.actionRow} ${danger ? styles.danger : ''} ${last ? styles.last : ''}`}
      onClick={onClick}
    >
      <div className={styles.rowText}>
        <span className={styles.rowLabel}>{label}</span>
        {desc && <span className={styles.rowDesc}>{desc}</span>}
      </div>
      <span className={styles.chevron}>›</span>
    </button>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState(loadPrefs)
  const [showWithdraw, setShowWithdraw] = useState(false)

  const togglePref = (key) => {
    const next = { ...prefs, [key]: prefs[key] === false ? true : !(prefs[key] ?? true) }
    setPrefs(next)
    savePrefs(next)
  }

  const getPref = (key, defaultVal = true) => prefs[key] ?? defaultVal

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userId')
    navigate('/login')
  }

  const handleWithdraw = () => {
    if (window.confirm('정말 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
      handleLogout()
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>설정</h1>
      </header>

      <div className={styles.body}>

        {/* 알림 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>알림</h2>
          <div className={styles.card}>
            <SettingRow
              label="앱 알림"
              desc="모든 알림 수신"
              right={<Toggle checked={getPref('allNotif')} onChange={() => togglePref('allNotif')} />}
            />
            <SettingRow
              label="좋아요"
              desc="내 게시글에 좋아요를 받을 때"
              right={<Toggle checked={getPref('likeNotif')} onChange={() => togglePref('likeNotif')} />}
            />
            <SettingRow
              label="댓글"
              desc="내 게시글에 댓글이 달릴 때"
              right={<Toggle checked={getPref('commentNotif')} onChange={() => togglePref('commentNotif')} />}
            />
            <SettingRow
              label="팔로우"
              desc="새 팔로워가 생길 때"
              right={<Toggle checked={getPref('followNotif')} onChange={() => togglePref('followNotif')} />}
              last
            />
          </div>
        </section>

        {/* 개인정보 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>개인정보 보호</h2>
          <div className={styles.card}>
            <SettingRow
              label="비공개 계정"
              desc="승인한 팔로워만 게시물을 볼 수 있습니다"
              right={<Toggle checked={getPref('privateAccount', false)} onChange={() => togglePref('privateAccount')} />}
            />
            <SettingRow
              label="활동 상태 표시"
              desc="다른 사용자에게 온라인 상태를 표시합니다"
              right={<Toggle checked={getPref('showActivity')} onChange={() => togglePref('showActivity')} />}
              last
            />
          </div>
        </section>

        {/* 콘텐츠 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>콘텐츠</h2>
          <div className={styles.card}>
            <ActionRow
              label="차단된 계정"
              desc="차단한 사용자 목록"
              onClick={() => {}}
            />
            <ActionRow
              label="숨긴 게시글"
              desc="숨김 처리한 게시글 관리"
              onClick={() => {}}
              last
            />
          </div>
        </section>

        {/* 계정 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>계정</h2>
          <div className={styles.card}>
            <ActionRow
              label="내 프로필"
              desc="프로필 정보 및 사진 변경"
              onClick={() => navigate('/profile/edit')}
            />
            <ActionRow
              label="로그아웃"
              onClick={handleLogout}
              last
            />
          </div>
        </section>

        {/* 위험 구역 */}
        <section className={styles.section}>
          <div className={styles.card}>
            <ActionRow
              label="계정 탈퇴"
              desc="계정과 모든 데이터가 영구 삭제됩니다"
              onClick={handleWithdraw}
              danger
              last
            />
          </div>
        </section>

        <p className={styles.version}>Looply v1.0.0</p>
      </div>
    </div>
  )
}
