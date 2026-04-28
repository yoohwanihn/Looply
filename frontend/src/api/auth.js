import client from './client.js'

export const signup = (data) => client.post('/auth/signup', data)

export const login = async (data) => {
  const res = await client.post('/auth/login', data)
  if (res?.accessToken) {
    localStorage.setItem('accessToken', res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)
    try {
      const payload = JSON.parse(atob(res.accessToken.split('.')[1]))
      localStorage.setItem('userId', payload.sub)
    } catch (_) {}
  }
  return res
}

export const logout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}
