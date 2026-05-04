import styles from './PostEditForm.module.css'

export default function PostEditForm({ content, onChange, onSave, onCancel, saving }) {
  return (
    <div className={styles.editForm} onClick={e => e.stopPropagation()}>
      <textarea
        className={styles.editTextarea}
        value={content}
        onChange={e => onChange(e.target.value.slice(0, 300))}
        rows={3}
        autoFocus
      />
      <div className={styles.editActions}>
        <button className={styles.editCancel} onClick={e => { e.stopPropagation(); onCancel() }}>
          취소
        </button>
        <button
          className={styles.editSave}
          onClick={e => { e.stopPropagation(); onSave(content) }}
          disabled={!content.trim() || saving}
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
