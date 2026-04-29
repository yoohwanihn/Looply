import client from './client.js'

export const follow = (userId) => client.post(`/users/${userId}/follow`)
export const unfollow = (userId) => client.delete(`/users/${userId}/follow`)
export const getFollowing = () => client.get('/users/me/following')
export const getFollowers = () => client.get('/users/me/followers')
