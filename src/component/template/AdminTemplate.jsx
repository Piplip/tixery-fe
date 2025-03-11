import {Outlet} from "react-router-dom";
import { Box, Toolbar } from '@mui/material';
import AdminNavigation from "../admin/AdminNavigation.jsx";
import AdminHeader from "../admin/AdminHeader.jsx";

function AdminTemplate(){
    return (
        <Box sx={{ display: 'flex' }}>
            <AdminHeader />
            <AdminNavigation />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}

export default AdminTemplate;