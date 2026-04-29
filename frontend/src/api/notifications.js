import client from './client.js'

export const getNotifications = (size = 30) =>
  client.get('/notifications', { params: { size } })

export const getUnreadCount = () =>
  client.get('/notifications/unread-count')

export const markAllRead = () =>
  client.patch('/notifications/read')
