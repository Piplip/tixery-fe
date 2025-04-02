import PropTypes from "prop-types";
import '../../styles/attendee-account-management-styles.css'
import {Stack, Typography} from "@mui/material";
import {NavLink, Outlet} from "react-router-dom";
import dayjs from "dayjs";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {getUserData} from "../../common/Utilities.js";

AttendeeProfileSettings.propTypes = {
    pid: PropTypes.number,
    data: PropTypes.object
}

function AttendeeProfileSettings() {
    const {t} = useTranslation()
    const [data, setData] = useState(null);

    useEffect(() => {
        if(data === null) {
            accountAxiosWithToken.get(`/attendee/profile?pid=${getUserData('profileID')}`)
                .then(r => {
                    setData(r.data)
                })
                .catch(err => console.log(err))
        }
    }, []);

    const links = [
        { to: '', labelKey: 'attendeeProfileSettings.contactInfo' },
        { to: 'password', labelKey: 'attendeeProfileSettings.password' },
        { to: 'email-preferences', labelKey: 'attendeeProfileSettings.emailPreferences' },
        { to: 'personal-info', labelKey: 'attendeeProfileSettings.personalData' },
    ];

    return (
        <div className={'attendee-account-management'}>
            <Stack rowGap={3}>
                <Stack direction={'row'} justifyContent={'space-between'}>
                    <Typography variant={'h4'} fontWeight={'bold'}>{t('attendeeProfileSettings.accountSettings')}</Typography>
                    {data?.account_created_at &&
                        <Typography variant={'body1'} color={'gray'}>{t('attendeeProfileSettings.joinedTixery')} {dayjs(data.account_created_at).format('DD MMM YYYY')}</Typography>
                    }
                </Stack>
                <Stack direction={'row'} columnGap={3}>
                    {links.map((link, index) => (
                        <NavLink to={link.to} className={({ isActive }) => isActive ? 'active-link' : 'profile-setting-link'} key={index} end={link.to === ''}>
                            <Typography variant={'h6'}>{t(link.labelKey)}</Typography>
                        </NavLink>
                    ))}
                </Stack>
                <Outlet context={{ pid: getUserData('profileID'), data }} />
            </Stack>
        </div>
    );
}

export default AttendeeProfileSettings;