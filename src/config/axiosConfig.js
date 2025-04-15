import axios from "axios";
import {getCookie} from "../common/Utilities.js";

let isDownloadInProgress = false;

const errorHandler = (error) => {
    if ((error.config.url === "/attendees/email" && error.response?.status === 404) || error.config.url === '/login' || error.config.url === '/signup') {
        return Promise.reject(error);
    }

    if (error.request?.responseType === 'blob') {
        return Promise.reject(error);
    }

    if (error.response) {
        const { status, data } = error.response;

        switch (status) {
            case 401:
                if (data.redirect) {
                    localStorage.removeItem('tk');
                    setTimeout(() => {
                        window.location.href = data.redirect;
                    }, 500);
                }
                break;

            case 429:
                sessionStorage.setItem(
                    "serverError",
                    JSON.stringify({
                        type: "rate-limit",
                        message: data?.message || "Too many requests. Please try again later."
                    })
                );
                window.location.href = "/error";
                break;

            case 503:
                sessionStorage.setItem(
                    "serverError",
                    JSON.stringify({
                        type: "server-down",
                        message: data?.message || "Service is currently unavailable. Please try again later."
                    })
                );
                window.location.href = "/error";
                break;

            default:
                sessionStorage.setItem(
                    "serverError",
                    JSON.stringify({
                        type: "unknown-error",
                        message: data?.message || "An unexpected error occurred. Please try again later."
                    })
                );
                window.location.href = "/error";
                break;
        }
    } else if (error.request) {
        sessionStorage.setItem(
            "serverError",
            JSON.stringify({
                type: "network-error",
                message: "No response from the server. Please check your network connection."
            })
        );
        window.location.href = "/error";
    }

    return Promise.reject(error);
}

export const rootAxios = axios.create({})

rootAxios.interceptors.response.use(
    response => {
        return response;
    },
    error => errorHandler(error)
)

export const configAxios = axios.create({
    baseURL: 'http://localhost:8888',
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

configAxios.interceptors.response.use(
    response => {
        return response;
    },
    error => errorHandler(error)
)

export const registryAxios = axios.create({
    baseURL: 'http://localhost:8761',
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

registryAxios.interceptors.response.use(
    response => {
        return response;
    },
    error => errorHandler(error)
)

export const gatewayAxios = axios.create({
    baseURL: 'http://localhost:4001',
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

const accountAxios = axios.create({
    baseURL: 'http://localhost:4001/accounts',
    timeout: 60000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

accountAxios.interceptors.response.use(
    response => {
        return response;
    }, error => errorHandler(error)
)

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
    response => {
        if (response.status === 202) {
            localStorage.setItem('tk', getCookie('AUTH_TOKEN'));
            window.location.reload();
        }
        return response;
    },
    error => errorHandler(error)
);

export const eventAxios = axios.create({
    baseURL: 'http://localhost:4001/events',
    timeout: 20000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

eventAxios.interceptors.response.use(
    response => {
        return response;
    },
    error => errorHandler(error)
)

export const eventAxiosWithToken = axios.create({
    baseURL: 'http://localhost:4001/events',
    timeout: 20000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
})

eventAxiosWithToken.interceptors.response.use(
    response => {
        if (response.status === 202) {
            localStorage.setItem('tk', getCookie('AUTH_TOKEN'));
            window.location.reload();
        }

        if (isDownloadInProgress) {
            isDownloadInProgress = false;
        }

        return response;
    },
    error => {
        if (error.request?.responseType === 'blob' &&
            error.response?.data instanceof Blob &&
            error.response?.status >= 200 &&
            error.response?.status < 300) {

            isDownloadInProgress = false;

            return Promise.resolve({
                data: error.response.data,
                headers: error.response.headers,
                status: error.response.status,
                statusText: error.response.statusText,
                config: error.config
            });
        }

        if (error.request?.responseType === 'blob') {
            isDownloadInProgress = false;
            return Promise.reject(error);
        }

        if (isDownloadInProgress) {
            isDownloadInProgress = false;
            return Promise.reject(error);
        }

        return errorHandler(error);
    }
);

eventAxiosWithToken.interceptors.request.use(
    config => {
        const token = localStorage.getItem('tk');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }

        if (config.responseType === 'blob') {
            config.headers['Accept'] = 'application/pdf';
            isDownloadInProgress = true;
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
