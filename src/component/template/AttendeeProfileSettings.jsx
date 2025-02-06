import PropTypes from "prop-types";
import {Stack, Typography} from "@mui/material";
import {NavLink, Outlet} from "react-router-dom";
import dayjs from "dayjs";

AttendeeProfileSettings.propTypes = {
    pid: PropTypes.number,
    data: PropTypes.object
}

const links = [
    {to: '', label: 'Contact Info'},
    {to: 'password', label: 'Password'},
    {to: 'credit-card', label: 'Credit/Debit Cards'},
    {to: 'email-preferences', label: 'Email Preferences'},
    {to: 'personal-info', label: 'Personal Data'},
]

function AttendeeProfileSettings({pid, data}) {
    return (
        <Stack rowGap={3}>
            <Stack direction={'row'} justifyContent={'space-between'}>
                <Typography variant={'h4'} fontWeight={'bold'}>Account Settings</Typography>
                {data?.account_created_at &&
                    <Typography variant={'body1'} color={'gray'}>Joined Tixery on {dayjs(data.account_created_at).format('MMM, D YYYY')}</Typography>
                }
            </Stack>
            <Stack direction={'row'} columnGap={3}>
                {links.map((link, index) => (
                    <NavLink to={link.to} className={({isActive}) => isActive ? 'active-link' : 'profile-setting-link'} key={index} end={link.to === ''}>
                        <Typography variant={'h6'}>{link.label}</Typography>
                    </NavLink>
                ))}
            </Stack>
            <Outlet context={{pid, data}}/>
        </Stack>
    );
}

export default AttendeeProfileSettings;