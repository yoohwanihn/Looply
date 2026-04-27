import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPost } from '../../api/posts.js'
import Post from '../../components/Post/Post.jsx'
import styles from './PostDetailPage.module.css'

export default function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getPost(id).then((res) => setPost(res)).catch(() => setError(true))
  }, [id])

  if (error) return <div className={styles.loading}>게시글을 불러올 수 없습니다.</div>
  if (!post) return <div className={styles.loading}>불러오는 중...</div>

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← 뒤로</button>
        <h2>게시글</h2>
      </header>
      <Post post={post} onUpdate={() => getPost(id).then((r) => setPost(r))} showComments />
    </div>
  )
}
