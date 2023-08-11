import axios from 'axios'

const baseUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/`
const jwtInterceptor = axios.create({})

jwtInterceptor.interceptors.request.use((config) => {
  return config
})

jwtInterceptor.interceptors.response.use(
  // response with 2xx code, doing nothing
  (response) => {
    return response
  },
  // response in the non 2xx part
  async (error) => {
    const originalRequest = error.config
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await axios.get(baseUrl + 'refresh', {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        })
        return axios(error.config)
      } catch (err) {
        console.log(err)
      }
    }
    //TODO handle error on interceptors
    else {
      return Promise.reject(error)
    }
  }
)

export default jwtInterceptor