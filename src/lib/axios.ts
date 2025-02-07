import axios from 'axios';
import Cookies from 'cookies-ts';

const cookies = new Cookies(); // 创建 cookies 实例

const baseURL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.example.com'
    : 'http://localhost:8080';

export const axiosInstance = axios.create({
  baseURL,
  timeout: 1500,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从 cookies 中读取认证令牌
    // const token = cookies.get('authToken');
    const token = '123456';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized. Redirecting to login...');
          //window.location.href = '/login';
          break;
        case 500:
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('Error:', error.response.status, error.response.data);
      }
    } else {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);
