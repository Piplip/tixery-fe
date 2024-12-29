import {jwtDecode} from "jwt-decode";

export function hasRole(roles){
    const token = localStorage.getItem('tk');
    if(!token) return false;
    const decoded = jwtDecode(token);
    return decoded.role ? roles.includes(decoded.role.toLowerCase()) : false;
}

export function checkLoggedIn(){
    return localStorage.getItem('tk') !== null;
}

export function getUserData(key){
    const token = localStorage.getItem('tk');
    if(!token) return null;
    const decoded = jwtDecode(token);
    return decoded[key];
}

export function generateFileName() {
    let seed = "abcdefghijklmnopqrstuvwxyz1234567890"
    let result = ''
    for (let i = 0; i < 20; i++) {
        result += seed[Math.floor(Math.random() * seed.length)]
    }
    return result
}

export function logout(){
    localStorage.removeItem('tk');
    window.location.href = '/login';
}
export function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

export function clearCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export function hasSearchParam(param){
    return new URLSearchParams(window.location.search).has(param);
}