import {jwtDecode} from "jwt-decode";
import {getDownloadURL, ref} from "firebase/storage";
import {eventAxiosWithToken, rootAxios} from "../config/axiosConfig.js";
import cookie from "react-cookies";
import {GoogleGenerativeAI} from "@google/generative-ai";
import dayjs from "dayjs";
import i18n from "i18next";
import "dayjs/locale/vi.js"
import 'dayjs/locale/en'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime);
dayjs.locale(i18n.language || 'en');

i18n.on('languageChanged', (lng) => {
    dayjs.locale(lng);
});

export function hasRole(roles){
    const token = localStorage.getItem('tk');
    if(!token) return false;
    return getUserData('role') ? roles.includes(getUserData('role').toLowerCase()) : false;
}

export function checkLoggedIn(){
    return !!localStorage.getItem('tk')
}

export function getUserData(key) {
    const token = localStorage.getItem('tk') ? localStorage.getItem('tk') : getCookie("tk");
    if (!token || token === 'null' || token === 'undefined' || token.split('.').length < 3) {
        return null;
    }
    try {
        const decoded = jwtDecode(token);
        return decoded[key];
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

export function generateFileName(len) {
    const _len = len || 20;
    let seed = "abcdefghijklmnopqrstuvwxyz1234567890"
    let result = ''
    for (let i = 0; i < _len; i++) {
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
            return JSON.parse(decodeURIComponent(cookie.substring(name.length + 1)));
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

export async function fetchImage(storage, imagePath) {
    if(!imagePath) return null;
    // if(!imagePath.includes('firebasestorage.googleapis.com')) return imagePath;
    try {
        const imageRef = ref(storage, imagePath);
        return await getDownloadURL(imageRef);
    } catch (error) {
        console.error('Error fetching image', error);
        return null;
    }
}

export function transformNumber(number){
    if(number > 1000000){
        return (number / 1000000).toFixed(1) + 'M';
    }
    if(number > 1000){
        return (number / 1000).toFixed(1) + 'K';
    }
    return number;
}
export async function getUserLocation(){
    const data = await rootAxios.get('https://ipinfo.io/json');
    if(data){
        cookie.save('user-location', {lat: data.data.loc.split(',')[0], lon: data.data.loc.split(',')[1],
                city: data.data.city, country: data.data.country},
            {path: '/', maxAge: 60 * 60 * 24 * 7})
    }
    localStorage.setItem('user-location', JSON.stringify({lat: data.data.loc.split(',')[0], lon: data.data.loc.split(',')[1]}));
}

export function formatCurrency(amount, currencyCode) {
    const formatter = new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: currencyCode,
    });

    return formatter.format(amount);
}

export async function generateGeminiContent(prompt, instruction){
    const genAI = new GoogleGenerativeAI("AIzaSyAwmJA03uThRP4NQgGmhUtSioSVqB7xPcU");

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: instruction
    });

    return await model.generateContent({
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: prompt,
                    }
                ],
            }
        ],
        generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.1,
        }
    });
}

export function configureDayjs() {
    const updateDayjsLocale = () => {
        const currentLocale = i18n.language;
        try {
            dayjs.locale(currentLocale);
        } catch (error) {
            console.warn(`Day.js locale not found for ${currentLocale}. Falling back to default.`, error);
            dayjs.locale('en');
        }
    };

    updateDayjsLocale();

    i18n.on('languageChanged', updateDayjsLocale);
}

export function collectData(eventID, type, strength, organizerID){
    if(!checkLoggedIn() || getUserData('role') === 'host')
        return;

    eventAxiosWithToken.post('/attendee/interaction', {
        profileID: getUserData('profileID'),
        eventID,
        type,
        strength,
        organizerID
    })
        .catch(err => console.log(err))
}

export function extractCity(addressString) {
    const cityRegex = /([A-Za-z\s]+)(?:,\s*\d{5},)?\s*[A-Za-z\s]+$/;
    const match = addressString.match(cityRegex);

    if (match && match[1]) {
        return match[1].trim();
    } else {
        return null;
    }
}

export const getContrastColor = (hexColor) => {
    const color = hexColor.replace('#', '');

    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const hexToRgba = (hex, alpha = 0.2) => {
    if (!hex) return 'rgba(33, 150, 243, 0.2)';
    hex = hex.replace(/^#/, '');

    let r, g, b;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};