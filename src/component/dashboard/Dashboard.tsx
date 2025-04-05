import * as React from 'react';
import {alpha} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppNavbar from './components/AppNavbar';
import SideMenu from './components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import {
    chartsCustomizations,
    dataGridCustomizations,
    datePickersCustomizations,
    treeViewCustomizations,
} from './theme/customizations';
import {Outlet} from 'react-router-dom';
import Header from "./components/Header";
import Copyright from "./internals/components/Copyright";

const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};

export default function Dashboard(props: { disableCustomTheme?: boolean }) {
    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <CssBaseline enableColorScheme/>
            <Box sx={{display: 'flex'}}>
                <SideMenu/>
                <AppNavbar/>
                <Box
                    component="main"
                    sx={(theme) => ({
                        flexGrow: 1, display: 'flex', flexDirection: 'column', rowGap: 2,
                        backgroundColor: theme.vars
                            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                            : alpha(theme.palette.background.default, 1),
                        overflow: 'auto',
                        p: 3,
                    })}
                >
                    <Header/>
                    <Outlet/>
                    <Copyright sx={{mt: 1.5}}/>
                </Box>
            </Box>
        </AppTheme>
    );
}
