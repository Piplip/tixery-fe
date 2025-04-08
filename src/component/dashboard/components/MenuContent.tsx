import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import {useLocation, useNavigate} from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const mainListItems = [
    {key: 'home', icon: <HomeRoundedIcon/>, path: '/admin'},
    {key: 'manageUsers', icon: <PeopleRoundedIcon/>, path: '/admin/users'},
    {key: 'manageEvent', icon: <SettingsRoundedIcon/>, path: '/admin/events'},
    {key: 'eventReport', icon: <AssignmentRoundedIcon/>, path: '/admin/reports'},
];

export default function MenuContent() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <Stack sx={{flexGrow: 1, p: 1}}>
            <List dense>
                {mainListItems.map((item) => (
                    <ListItem key={item.key} disablePadding sx={{display: 'block'}}>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => handleNavigation(item.path)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={t(`menuContent.${item.key}`)}/>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Stack>
    );
}