import http from '../http'

// 登录
export function loginApi(data: any) {
    // 你自己填
    return http.post('/YOUR_LOGIN_API', data)
}

// 获取当前用户信息
export function getUserInfoApi() {
    // 你自己填
    return http.get('/YOUR_USERINFO_API')
}

// 退出登录
export function logoutApi() {
    // 你自己填
    return http.post('/YOUR_LOGOUT_API')
}