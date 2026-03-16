import api from './axios';

export function registerApi(data: {
    username: string;
    email: string;
    password: string;
}) {
    return api.post('/auth/register', data);
}

export function loginApi(data: {
    email: string;
    password: string;
}) {
    return api.post('/auth/login', data);
}

export function meApi() {
    return api.get('/auth/me');
}

export function logoutApi() {
    return api.post('/auth/logout');
}

export function logoutAllApi() {
    return api.post('/auth/logout-all');
}

export function chatApi(data: {
    messages: Array<{ role: string; content: string }>;
}) {
    return api.post('/ai/chat', data);
}