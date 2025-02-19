import PropTypes from "prop-types";
import {Stack, Typography} from "@mui/material";
import {NavLink, Outlet} from "react-router-dom";
import dayjs from "dayjs";
import {useTranslation} from "react-i18next";

AttendeeProfileSettings.propTypes = {
    pid: PropTypes.number,
    data: PropTypes.object
}

function AttendeeProfileSettings({pid, data}) {
    const {t} = useTranslation()

    const links = [
        { to: '', labelKey: 'attendeeProfileSettings.contactInfo' },
        { to: 'password', labelKey: 'attendeeProfileSettings.password' },
        { to: 'credit-card', labelKey: 'attendeeProfileSettings.creditDebitCards' },
        { to: 'email-preferences', labelKey: 'attendeeProfileSettings.emailPreferences' },
        { to: 'personal-info', labelKey: 'attendeeProfileSettings.personalData' },
    ];

    return (
        <Stack rowGap={3}>
            <Stack direction={'row'} justifyContent={'space-between'}>
                <Typography variant={'h4'} fontWeight={'bold'}>{t('attendeeProfileSettings.accountSettings')}</Typography>
                {data?.account_created_at &&
                    <Typography variant={'body1'} color={'gray'}>{t('attendeeProfileSettings.joinedTixery')} {dayjs(data.account_created_at).format('MMM, D YYYY')}</Typography>
                }
            </Stack>
            <Stack direction={'row'} columnGap={3}>
                {links.map((link, index) => (
                    <NavLink to={link.to} className={({ isActive }) => isActive ? 'active-link' : 'profile-setting-link'} key={index} end={link.to === ''}>
                        <Typography variant={'h6'}>{t(link.labelKey)}</Typography>
                    </NavLink>
                ))}
            </Stack>
            <Outlet context={{ pid, data }} />
        </Stack>
    );
}

export default AttendeeProfileSettings;