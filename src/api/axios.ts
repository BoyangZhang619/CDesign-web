import axios from 'axios';
import { useAuthStore } from '../stores/auth.js';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true
});

/**
 * 请求拦截器：
 * 自动把 access token 放进 Authorization
 */
api.interceptors.request.use((config) => {
    const authStore = useAuthStore();

    if (authStore.accessToken) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }

    return config;
});

/**
 * 响应拦截器：
 * 如果 access token 过期，尝试调用 refresh
 */
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

function processQueue(error: any, token = null) {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error || token === null) {
            reject(error);
        } else {
            resolve(token);
        }
    });

    pendingQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const authStore = useAuthStore();
        const originalRequest = error.config;

        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('auth/refresh') &&
            !originalRequest.url.includes('auth/login')
        ) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({
                        resolve: (token) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject
                    });
                });
            }

            isRefreshing = true;

            try {
                const res = await api.post('auth/refresh');
                const newToken = res.data.accessToken;

                authStore.setAccessToken(newToken);
                processQueue(null, newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                authStore.clearAuth();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;