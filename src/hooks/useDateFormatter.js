import { useMemo } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.locale('en');

export const useDateFormatter = () => {
    return useMemo(() => ({
        formatDate: (date, format = 'DD/MM/YYYY') => {
            return dayjs(date).format(format);
        },
        getRelativeTime: (date) => {
            return dayjs(date).fromNow();
        },
        createDayjs: (date) => {
            return dayjs(date);
        }
    }), []);
}; 