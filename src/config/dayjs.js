import dayjs from 'dayjs';
import i18n from 'i18next';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

dayjs.extend(relativeTime);

const currentLocale = i18n.language || 'en';
dayjs.locale(currentLocale);

i18n.on('languageChanged', (lng) => {
    dayjs.locale(lng);
});

export const getDayjs = (date) => {
    return dayjs(date);
};

export default dayjs; 