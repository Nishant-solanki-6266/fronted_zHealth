import axios from 'axios'

const getRawApiUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL
  if (envUrl && envUrl.trim() !== '') {
    envUrl = envUrl.trim().replace(/\/+$/, '')
    if (envUrl.startsWith('https://localhost') || envUrl.startsWith('https://127.0.0.1')) {
      envUrl = envUrl.replace(/^https:/, 'http:')
    }
    return envUrl
  }
  return 'https://zhealthos-backend-production.up.railway.app'
}

const API_BASE_URL = getRawApiUrl()

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
export { API_BASE_URL }
