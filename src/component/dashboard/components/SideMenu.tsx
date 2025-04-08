import * as React from 'react';
import {styled} from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, {drawerClasses} from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu';
import {getUserData} from '../../../common/Utilities';
import {useTranslation} from "react-i18next";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
    width: drawerWidth,
    flexShrink: 0,
    boxSizing: 'border-box',
    mt: 10,
    [`& .${drawerClasses.paper}`]: {
        width: drawerWidth,
        boxSizing: 'border-box',
    },
});

export default function SideMenu() {
    const { t } = useTranslation();
    const fullName = getUserData("fullName");
    const sub = getUserData("sub");

    return (
        <Drawer
            variant="permanent"
            sx={{
                display: {xs: 'none', md: 'block'},
                [`& .${drawerClasses.paper}`]: {
                    backgroundColor: 'background.paper',
                },
            }}
        >
            <Box
                component="img"
                src="https://res.cloudinary.com/de25mkp9v/image/upload/v1743413016/logo_xdxerq.png"
                alt="Event Logo"
                sx={{width: '150px', marginBlock: 2, mx: 'auto'}}
            />
            <Divider/>
            <Box
                sx={{
                    overflow: 'auto',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <MenuContent/>
            </Box>
            <Stack
                direction="row"
                sx={{
                    p: 1,
                    gap: 1,
                    alignItems: 'center',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Avatar
                    sizes="small"
                    alt={fullName}
                    src="/static/images/avatar/7.jpg"
                    sx={{width: 36, height: 36}}
                />
                <Box sx={{mr: 'auto'}}>
                    <Typography variant="body2" sx={{fontWeight: 500, lineHeight: '16px'}}>
                        {fullName}
                    </Typography>
                    <Typography variant="caption" sx={{color: 'text.secondary'}}>
                        {sub}
                    </Typography>
                </Box>
                <OptionsMenu/>
            </Stack>
        </Drawer>
    );
}
