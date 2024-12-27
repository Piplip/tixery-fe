import {jwtDecode} from "jwt-decode";

export function hasRole(roles){
    const token = localStorage.getItem('tk');
    if(!token) return false;
    const decoded = jwtDecode(token);
    return roles.includes(decoded.role.toLowerCase());
}

export function isLoggedIn(){
    return !!localStorage.getItem('tk')
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