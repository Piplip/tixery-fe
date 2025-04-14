import {useMemo} from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');

export const useDayjs = () => {
    return useMemo(() => ({
        formatDate: (date, format = "DD/MM/YYYY") => dayjs(date).format(format),
        formatTime: (date, format = "HH:mm") => dayjs(date).format(format),
        
        getRelativeTime: (date) => dayjs(date).fromNow(),
        
        create: (date, format) => dayjs(date, format),
        add: (date, amount, unit) => dayjs(date).add(amount, unit),
        isValid: (date) => dayjs(date).isValid(),
        isBefore: (date1, date2) => dayjs(date1).isBefore(date2),
        
        tz: (date, timezone) => dayjs(date).tz(timezone),
        utc: (date) => dayjs(date).utc(),
        
        now: () => dayjs(),
        
        dayjs: dayjs
    }), []);
}; 