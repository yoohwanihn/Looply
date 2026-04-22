import client from './client.js'

export const getMyProfile = () => client.get('/users/me')
export const getProfile = (id) => client.get(`/users/${id}`)
export const updateProfile = (data) => client.patch('/users/me/profile', data)
export const uploadAvatar = (file) => {
  const form = new FormData()
  form.append('file', file)
  return client.post('/users/me/avatar', form)
}
export const searchUsers = (q) => client.get('/users/search', { params: { q } })
