import axios from 'axios'

// This is the ONE place that knows the backend's address. Every other
// file in the app imports "api" from here instead of calling axios
// directly - that way if the backend address ever changes, we only
// update it in one place (the .env file).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// This runs automatically BEFORE every single request the app makes.
// If the user is logged in, we grab their saved token and attach it
// as an "Authorization" header - this is how the backend recognizes
// "oh, this is user #5, who is an Admin" on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nj_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// This runs automatically AFTER every response. If the backend ever
// says "401 Unauthorized" (meaning the token expired or is invalid),
// we automatically log the user out on our side too, so the site
// doesn't get stuck showing them as "logged in" when they're not.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('nj_token')
      localStorage.removeItem('nj_user')
    }
    return Promise.reject(error)
  }
)

export default api
