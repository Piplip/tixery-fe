import axios from "axios";

const accountAxios = axios.create({
    baseURL: 'http://localhost:4001/accounts',
    timeout: 60000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

export const accountAxiosWithToken = axios.create({
    baseURL: 'http://localhost:4001/accounts',
    timeout: 60000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

accountAxiosWithToken.interceptors.request.use(
    config => {
        const token = localStorage.getItem('tk');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

accountAxiosWithToken.interceptors.response.use(
    response => response,
    error => {
        console.log(error)
        if (error.response && error.response.status === 401) {
            const data = error.response.data;
            if (data.redirect) {
                localStorage.removeItem('tk');
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 500)
            }
        }
        return Promise.reject(error);
    }
)

export const eventAxios = axios.create({
    baseURL: 'http://localhost:4001/events',
    timeout: 20000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

export const eventAxiosWithToken = axios.create({
    baseURL: 'http://localhost:4001/events',
    timeout: 20000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

eventAxiosWithToken.interceptors.response.use(
    response => response,
    error => {
        console.log(error)
        if (error.response && error.response.status === 401) {
            const data = error.response.data;
            if (data.redirect) {
                localStorage.removeItem('tk');
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 500)
            }
        }
        return Promise.reject(error);
    }
)

eventAxiosWithToken.interceptors.request.use(
    config => {
        const token = localStorage.getItem('tk');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export const nominatimAxios = axios.create({
    baseURL: 'https://nominatim.openstreetmap.org',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

export const locationIQAxios = axios.create({
    baseURL: 'https://us1.locationiq.com/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

export default accountAxios;