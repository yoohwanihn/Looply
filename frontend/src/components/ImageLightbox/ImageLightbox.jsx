import { useEffect } from 'react'
import styles from './ImageLightbox.module.css'

export default function ImageLightbox({ images, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && index > 0) onPrev()
      else if (e.key === 'ArrowRight' && index < images.length - 1) onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [index, images.length, onClose, onPrev, onNext])

  return (
    <div className={styles.overlay} onClick={(e) => { e.stopPropagation(); onClose() }}>
      {images.length > 1 && index > 0 && (
        <button
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          aria-label="이전"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      <img
        className={styles.image}
        src={images[index]}
        alt={`이미지 ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && index < images.length - 1 && (
        <button
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={(e) => { e.stopPropagation(); onNext() }}
          aria-label="다음"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {images.length > 1 && (
        <div className={styles.counter}>{index + 1} / {images.length}</div>
      )}

      <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
