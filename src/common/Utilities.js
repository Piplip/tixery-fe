import {jwtDecode} from "jwt-decode";
import {getDownloadURL, ref} from "firebase/storage";
import {rootAxios} from "../config/axiosConfig.js";
import cookie from "react-cookies";
import {GoogleGenerativeAI} from "@google/generative-ai";
import dayjs from "dayjs";
import i18n from "i18next";

export function hasRole(roles){
    const token = localStorage.getItem('tk');
    if(!token) return false;
    return getUserData('role') ? roles.includes(getUserData('role').toLowerCase()) : false;
}

export function checkLoggedIn(){
    return !!localStorage.getItem('tk')
}

export function getUserData(key){
    const token = localStorage.getItem('tk') ? localStorage.getItem('tk') : getCookie("tk")
    if(token === null || token === undefined) return null;
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

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export async function fetchImage(storage, imagePath) {
    if(!imagePath) return null;
    try {
        const imageRef = ref(storage, imagePath);
        return await getDownloadURL(imageRef);
    } catch (error) { /* empty */ }
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
    cookie.save('user-location', {lat: data.data.loc.split(',')[0], lon: data.data.loc.split(',')[1],
        city: data.data.city, country: data.data.country},
        {path: '/', maxAge: 60 * 60 * 24 * 7})
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

import "dayjs/locale/vi.js"

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