import client from './client.js'

export const getTimeline = (cursor) =>
  client.get('/posts/timeline', { params: cursor ? { cursor } : {} })

export const getPost = (id) => client.get(`/posts/${id}`)

export const createPost = (content, images) => {
  const form = new FormData()
  form.append('content', content)
  if (images) images.forEach((f) => form.append('images', f))
  return client.post('/posts', form)
}

export const updatePost = (id, content) =>
  client.patch(`/posts/${id}`, { content })

export const deletePost = (id) => client.delete(`/posts/${id}`)

export const likePost = (id) => client.post(`/posts/${id}/likes`)
export const unlikePost = (id) => client.delete(`/posts/${id}/likes`)

export const repost = (id) => client.post(`/posts/${id}/repost`)
export const undoRepost = (id) => client.delete(`/posts/${id}/repost`)

export const getComments = (postId) => client.get(`/posts/${postId}/comments`)
export const createComment = (postId, content) =>
  client.post(`/posts/${postId}/comments`, { content })
export const deleteComment = (id) => client.delete(`/comments/${id}`)
