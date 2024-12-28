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

accountAxiosWithToken.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            const data = error.response.data;
            if (data.redirect) {
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 500)
            }
        }
        return Promise.reject(error);
    }
)

export default accountAxios;