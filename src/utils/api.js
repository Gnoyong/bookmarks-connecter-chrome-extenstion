import axios from 'axios'
import { ElNotification } from 'element-plus'

const instance = axios.create({
  baseURL: 'http://localhost:3000/',
  timeout: 1000
})

instance.interceptors.response.use(
  function (response) {
    if (response.data.code !== 2000) {
      ElNotification({
        message: response.data.message,
        type: 'error',
        position: 'bottom-right'
      })
    }
    return response
  },
  function (error) {
    ElNotification({
      message: 'HTTP 响应异常',
      type: 'error',
      position: 'bottom-right'
    })
    return Promise.reject(error)
  }
)

export default {
  query() {
    return instance({
      url: '/bookmark',
      method: 'get'
    })
  },
  queryView() {
    return instance({
      url: '/bookmark/view',
      method: 'get'
    })
  },
  upload(formData) {
    return instance({
      url: '/upload',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  initialize() {
    return instance({
      url: '/bookmark/init',
      method: 'post'
    })
  }
}
