import styles from './PlaceholderPage.module.css'

export default function PlaceholderPage({ title }) {
  return (
    <div className={styles.container}>
      <p className={styles.title}>{title}</p>
      <p className={styles.sub}>준비 중입니다.</p>
    </div>
  )
}
