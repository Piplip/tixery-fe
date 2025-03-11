import {Box, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Toolbar,} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import StorageIcon from '@mui/icons-material/Storage';
import TimelineIcon from '@mui/icons-material/Timeline';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WarningIcon from '@mui/icons-material/Warning';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {useTheme} from '@mui/material/styles';
import {useState} from "react";
import {NavLink} from "react-router-dom";

const drawerWidth = 240;
const collapsedDrawerWidth = 60;

function AdminNavigation(){
    const theme = useTheme();
    const [open, setOpen] = useState(true);

    const navigationItems = [
        { text: 'Overview', icon: <DashboardIcon />, link: '' },
        { text: 'Config Server', icon: <SettingsIcon />, link: 'config/dashboard' },
        { text: 'Service Registry', icon: <StorageIcon />, link: 'registry/dashboard' },
        { text: 'Gateway Service', icon: <StorageIcon />, link: 'gateway/dashboard' },
        { text: 'Event Service', icon: <StorageIcon />, link: 'event/dashboard' },
        { text: 'Account Service', icon: <StorageIcon />, link: 'account/dashboard' },
        { text: 'Tracing', icon: <TimelineIcon />, link: 'tracing' },
        { text: 'Logs', icon: <ReceiptIcon />, link: 'logs' },
        { text: 'Alerts', icon: <WarningIcon />, link: 'alerts' },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: open ? drawerWidth : collapsedDrawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: open ? drawerWidth : collapsedDrawerWidth,
                    boxSizing: 'border-box',
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    overflowX: 'hidden',
                    top: '64px',
                },
            }}
        >
            <Toolbar
                sx={{
                    justifyContent: open ? 'flex-end' : 'center',
                    px: [1],
                }}
            >
                <IconButton onClick={() => setOpen(!open)}>
                    {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            </Toolbar>
            <Divider />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {navigationItems.map((item, index) => (
                        <NavLink key={index} to={item.link} end={item.link === ''}
                                 style={({ isActive }) => ({
                                     color: isActive ? 'red' : 'inherit',
                                 })}
                        >
                            <ListItem button>
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {open && <ListItemText primary={item.text} />}
                            </ListItem>
                        </NavLink>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
}

export default AdminNavigation;

